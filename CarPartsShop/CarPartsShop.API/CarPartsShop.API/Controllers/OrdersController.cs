using CarPartsShop.API.Auth;
using CarPartsShop.API.Data;
using CarPartsShop.API.DTOs.Orders;
using CarPartsShop.API.Enums;
using CarPartsShop.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace CarPartsShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private const decimal TAX_RATE = 0.20m; // adjust if you like

        public OrdersController(AppDbContext db) => _db = db;

        // GET: /api/orders/my
        [HttpGet("my")]
        [Authorize(Roles = Roles.Customer)]
        [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var customer = await _db.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (customer == null)
                return NotFound("Customer profile not found.");

            var orders = await _db.Orders
                .AsNoTracking()
                .Where(o => o.CustomerId == customer.Id)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var partIds = orders.SelectMany(o => o.Items.Select(i => i.PartId)).Distinct().ToList();
            var parts = await _db.Parts
                .Where(p => partIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var result = orders.Select(order => new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList()
            });

            return Ok(result);
        }

        // GET: /api/orders/recent?limit=10
        [HttpGet("recent")]
        [Authorize(Roles = $"{Roles.Administrator},{Roles.SalesAssistant}")]
        [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetRecentOrders([FromQuery] int limit = 10)
        {
            var orders = await _db.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Take(limit)
                .ToListAsync();

            var partIds = orders.SelectMany(o => o.Items.Select(i => i.PartId)).Distinct().ToList();
            var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

            var result = orders.Select(order => new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList()
            });

            return Ok(result);
        }


        // POST: /api/orders
        [HttpPost]
        [Authorize(Roles = Roles.Customer)] // only Customers can place orders
        [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [Authorize(Roles = Roles.Customer)] // only Customers can place orders
        [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrderResponseDto>> CreateOrder([FromBody] CreateOrderDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("Order must contain at least one item.");

            // Get current user ID from JWT
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Find the matching customer record by UserId
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null) return NotFound("Customer profile not found.");

            var partIds = dto.Items.Select(i => i.PartId).Distinct().ToList();
            var parts = await _db.Parts
                .Where(p => partIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            foreach (var item in dto.Items)
            {
                if (!parts.ContainsKey(item.PartId))
                    return NotFound($"Part {item.PartId} not found.");

                if (item.Quantity <= 0)
                    return BadRequest("Quantity must be positive.");

                var part = parts[item.PartId];
                if (part.QuantityInStock < item.Quantity)
                    return BadRequest($"Not enough stock for PartId {item.PartId}. Requested {item.Quantity}, available {part.QuantityInStock}.");
            }

            decimal subtotal = 0m;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var part = parts[item.PartId];
                subtotal += part.Price * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    PartId = part.Id,
                    Quantity = item.Quantity,
                    UnitPrice = part.Price
                });

                part.QuantityInStock -= item.Quantity; // Decrease stock
            }

            var tax = Math.Round(subtotal * TAX_RATE, 2, MidpointRounding.AwayFromZero);
            var total = subtotal + tax;

            var order = new Order
            {
                CustomerId = customer.Id,
                CreatedAt = DateTime.UtcNow,
                Subtotal = subtotal,
                Tax = tax,
                Total = total,
                Status = OrderStatus.Pending,
                Items = orderItems,
                StatusHistory = new List<OrderStatusHistory>
        {
            new OrderStatusHistory
            {
                Status = OrderStatus.Pending,
                ChangedAt = DateTime.UtcNow
            }
        }
            };

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                _db.Orders.Add(order);
                await _db.SaveChangesAsync();
                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            var response = new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, response);
        }

        // GET: /api/orders/{id}?includeHistory=true
        [HttpGet("{id:int}")]
        [Authorize(Roles = $"{Roles.Administrator},{Roles.SalesAssistant}")]
        [ProducesResponseType(typeof(OrderResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrderResponseDto>> GetOrderById(int id, [FromQuery] bool includeHistory = false)
        {
            IQueryable<Order> query = _db.Orders
                .Include(o => o.Items); // Always include Items

            if (includeHistory)
                query = query.Include(o => o.StatusHistory); // Conditionally include StatusHistory

            var order = await query.FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();

            var partIds = order.Items.Select(i => i.PartId).Distinct().ToList();
            var parts = await _db.Parts
                .Where(p => partIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var dto = new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList(),
                StatusHistory = includeHistory
                    ? order.StatusHistory
                        .OrderBy(h => h.ChangedAt)
                        .Select(h => new OrderStatusHistoryDto
                        {
                            Status = h.Status.ToString(),
                            ChangedAt = h.ChangedAt
                        }).ToList()
                    : null
            };

            return Ok(dto);
        }



        // GET: /api/customers/{customerId}/orders
        [HttpGet("/api/customers/{customerId:int}/orders")]
        [Authorize(Roles = $"{Roles.Administrator},{Roles.SalesAssistant}")]
        [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrdersForCustomer(int customerId)
        {
            var orders = await _db.Orders
                .AsNoTracking()
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var partIds = orders.SelectMany(o => o.Items.Select(i => i.PartId)).Distinct().ToList();
            var parts = await _db.Parts.Where(p => partIds.Contains(p.Id))
                                       .ToDictionaryAsync(p => p.Id);

            var result = orders.Select(order => new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList()
            });

            return Ok(result);
        }

        // GET: /api/orders
        [HttpGet]
        [Authorize(Roles = $"{Roles.Administrator},{Roles.SalesAssistant}")]
        [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetAllOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? customerName = null,
            [FromQuery] int? customerId = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            var query = _db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Items)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(customerName))
                query = query.Where(o => o.Customer.FirstName.Contains(customerName) || o.Customer.LastName.Contains(customerName));

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId);

            if (from.HasValue)
                query = query.Where(o => o.CreatedAt >= from);

            if (to.HasValue)
                query = query.Where(o => o.CreatedAt <= to);

            var total = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var partIds = orders.SelectMany(o => o.Items.Select(i => i.PartId)).Distinct();
            var parts = await _db.Parts.Where(p => partIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

            var results = orders.Select(order => new OrderResponseDto
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CreatedAt = order.CreatedAt,
                Subtotal = order.Subtotal,
                Tax = order.Tax,
                Total = order.Total,
                Status = order.Status.ToString(),
                Items = order.Items.Select(oi => new OrderItemResponseDto
                {
                    PartId = oi.PartId,
                    PartName = parts[oi.PartId].Name,
                    Sku = parts[oi.PartId].Sku,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    LineTotal = oi.UnitPrice * oi.Quantity
                }).ToList()
            });

            Response.Headers.Add("X-Total-Count", total.ToString());

            return Ok(results);
        }

        // PATCH: /api/orders/{id}/status
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = $"{Roles.Administrator},{Roles.SalesAssistant}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            if (!Enum.TryParse<OrderStatus>(dto.Status, true, out var newStatus))
                return BadRequest("Invalid status value.");

            var order = await _db.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            order.Status = newStatus;
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
