namespace CarPartsShop.API.DTOs.Parts
{
    public class CreatePartDto
    {
        public string Name { get; set; } = null!;
        public string Sku { get; set; } = null!;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public int CategoryId { get; set; }
    }
}
