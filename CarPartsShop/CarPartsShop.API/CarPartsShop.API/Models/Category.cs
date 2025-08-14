using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarPartsShop.API.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = default!;

        [MaxLength(500)]
        public string? Description { get; set; }

        public ICollection<Part> Parts { get; set; } = new List<Part>();
    }
}
