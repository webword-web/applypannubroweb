namespace ApplyPannuBro.Models
{
    public class Banner
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string LinkUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
        public string Content { get; set; } = string.Empty;
    }
}
