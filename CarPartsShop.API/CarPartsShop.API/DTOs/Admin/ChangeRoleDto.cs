using CarPartsShop.API.Auth;
using Microsoft.AspNetCore.Authorization;

namespace CarPartsShop.API.DTOs.Admin
{
    [Authorize(Roles = $"{Roles.Administrator}")]
    public class ChangeRoleDto
    {
        public string Role { get; set; } = default!;
    }
}
