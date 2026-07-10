namespace ApplyPannuBro.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int DisplayOrder { get; set; } = 0;
        public bool IsEnabled { get; set; } = true;
        public string Status { get; set; } = "available";
        public string Category { get; set; } = string.Empty;
    }
}
