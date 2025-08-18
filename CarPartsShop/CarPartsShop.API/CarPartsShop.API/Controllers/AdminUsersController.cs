using CarPartsShop.API.Auth;
using CarPartsShop.API.Data;
using CarPartsShop.API.DTOs.Admin;
using CarPartsShop.API.Models;
using CarPartsShop.API.Models.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarPartsShop.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = Roles.Administrator)]
    public class AdminUsersController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly AppDbContext _db;

        public AdminUsersController(
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            AppDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        // -------------------- USERS --------------------

        public class UserListItemDto
        {
            public string Id { get; set; } = default!;
            public string Email { get; set; } = default!;
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public List<string> Roles { get; set; } = new();
            public bool LockedOut { get; set; }
        }

        [HttpGet("users")]
        public async Task<ActionResult<object>> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var q = _userManager.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(u =>
                    (u.Email ?? "").Contains(s) ||
                    (u.UserName ?? "").Contains(s) ||
                    (u.FirstName ?? "").Contains(s) ||
                    (u.LastName ?? "").Contains(s));
            }

            var total = await q.CountAsync();
            var users = await q
                .OrderBy(u => u.Email)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var list = new List<UserListItemDto>();
            foreach (var u in users)
            {
                var roles = (await _userManager.GetRolesAsync(u)).ToList();
                var locked = (u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTimeOffset.UtcNow);
                list.Add(new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email!,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Roles = roles,
                    LockedOut = locked
                });
            }

            Response.Headers["X-Total-Count"] = total.ToString();
            return Ok(new { page, pageSize, total, items = list });
        }

        [Authorize(Roles = $"{Roles.Administrator}")]
        [HttpPatch("users/{id}/role")]
        public async Task<IActionResult> ChangeRole(string id, [FromBody] ChangeRoleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Role)) return BadRequest("Role required.");

            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == user.Id) return Forbid();

            var currentRoles = await _userManager.GetRolesAsync(user);
            var remove = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!remove.Succeeded) return BadRequest(remove.Errors);

            if (!await _roleManager.RoleExistsAsync(dto.Role))
                return BadRequest("Role does not exist.");

            var add = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!add.Succeeded) return BadRequest(add.Errors);

            await LogAdminAction($"Changed role of {user.Email} to {dto.Role}");

            return NoContent();
        }

        public class LockDto { public bool Locked { get; set; } }

        [HttpPatch("users/{id}/lock")]
        public async Task<IActionResult> LockUser(string id, [FromBody] LockDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == user.Id) return Forbid();

            if (dto.Locked)
            {
                user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            }
            else
            {
                user.LockoutEnd = null;
            }

            var res = await _userManager.UpdateAsync(user);
            if (!res.Succeeded) return BadRequest(res.Errors);

            await LogAdminAction($"{(dto.Locked ? "Locked" : "Unlocked")} user {user.Email}");

            return NoContent();
        }

        [Authorize(Roles = $"{Roles.Administrator}")]
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == user.Id) return Forbid();

            var res = await _userManager.DeleteAsync(user);
            if (!res.Succeeded) return BadRequest(res.Errors);

            await LogAdminAction($"Deleted user {user.Email}");

            return NoContent();
        }

        // -------------------- DASHBOARD STATS --------------------

        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsDto>> GetStats([FromQuery] int lowStockThreshold = 5)
        {
            // Orders
            var totalOrders = await _db.Orders.CountAsync();

            // Users (Identity)
            var totalUsers = await _userManager.Users.CountAsync();

            // Revenue (sum of Order.Total; handles empty DB safely)
            var totalRevenue = await _db.Orders.SumAsync(o => (decimal?)o.Total) ?? 0m;

            // Low stock parts (<= threshold)
            var lowStockCount = await _db.Parts.CountAsync(p => p.QuantityInStock <= lowStockThreshold);

            return Ok(new AdminStatsDto
            {
                TotalOrders = totalOrders,
                TotalUsers = totalUsers,
                TotalRevenue = Math.Round(totalRevenue, 2),
                LowStockCount = lowStockCount
            });
        }

        // -------------------- DASHBOARD LOGS --------------------

        [HttpGet("logs")]
        public async Task<ActionResult<IEnumerable<AdminLogDto>>> GetLogs([FromQuery] int take = 10)
        {
            take = (take <= 0 || take > 50) ? 10 : take;

            var logs = await _db.AdminLogs
                .AsNoTracking()
                .OrderByDescending(l => l.Timestamp)
                .Take(take)
                .Select(l => new AdminLogDto
                {
                    Id = l.Id,
                    Timestamp = l.Timestamp,
                    UserEmail = l.PerformedByEmail,
                    Action = l.Action
                })
                .ToListAsync();

            return Ok(logs);
        }

        private async Task LogAdminAction(string action)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "unknown";
            var userEmail = User.Identity?.Name ?? "unknown";

            _db.AdminLogs.Add(new AdminLog
            {
                Timestamp = DateTime.UtcNow,
                PerformedById = userId,
                PerformedByEmail = userEmail,
                Action = action
            });

            await _db.SaveChangesAsync();
        }
    }
}
