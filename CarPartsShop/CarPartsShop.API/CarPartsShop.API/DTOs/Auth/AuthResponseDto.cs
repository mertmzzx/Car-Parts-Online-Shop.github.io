namespace CarPartsShop.API.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
    }
}
