using System.ComponentModel.DataAnnotations;
using CarPartsShop.API.Models.Identity;
using Microsoft.EntityFrameworkCore;

namespace CarPartsShop.API.Models
{
    [Index(nameof(Email), IsUnique = true)]
    public class Customer
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public AppUser? AppUser { get; set; } = null!;

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = default!;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = default!;

        [Required, MaxLength(255), EmailAddress]
        public string Email { get; set; } = default!;

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? AddressLine1 { get; set; }

        [MaxLength(255)]
        public string? AddressLine2 { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
