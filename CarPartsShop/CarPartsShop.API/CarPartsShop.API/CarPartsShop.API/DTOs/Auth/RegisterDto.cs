namespace CarPartsShop.API.DTOs.Auth
{
    public sealed class RegisterDto
    {
        public string FirstName { get; set; } = default!;
        public string LastName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string? ConfirmPassword { get; set; }
    }

}
