using CarPartsShop.API.Auth;
using CarPartsShop.API.DTOs.Auth;
using CarPartsShop.API.Models.Identity;
using CarPartsShop.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CarPartsShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly JwtTokenService _tokenService;

        public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, JwtTokenService tokenService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        // POST: /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return BadRequest("Email is already in use.");
            }

            var user = new AppUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Assign Customer role
            await _userManager.AddToRoleAsync(user, Roles.Customer);

            var token = await _tokenService.CreateTokenAsync(user);
            var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Customer";

            return Ok(new AuthResponseDto
            {
                Token = token,
                Role = role,
                UserName = user.UserName!
            });
        }

        // POST: /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Invalid email or password.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
                return Unauthorized("Invalid email or password.");

            var token = await _tokenService.CreateTokenAsync(user);
            var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? "Customer";

            return Ok(new AuthResponseDto
            {
                Token = token,
                Role = role,
                UserName = user.UserName!
            });
        }
    }
}
