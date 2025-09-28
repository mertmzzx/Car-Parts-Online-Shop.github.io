namespace CarPartsShop.API.DTOs.Users
{
    public class UserListItemDto
    {
        public string Id { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool LockedOut { get; set; }
    }
}
