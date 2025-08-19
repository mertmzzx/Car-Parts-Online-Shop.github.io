namespace CarPartsShop.API.DTOs.Orders
{
    public class CreateOrderItemDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateOrderDto
    {
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }
}
