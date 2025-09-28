namespace CarPartsShop.API.Enums
{
    public enum OrderStatus
    {
        Pending,         // Just placed
        Processing,      // Picked up by staff
        Shipped,         // Left warehouse
        Delivered,       // Delivered to customer
        Cancelled        // Cancelled for any reason
    }
}
