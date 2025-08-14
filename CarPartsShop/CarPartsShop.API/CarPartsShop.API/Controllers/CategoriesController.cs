using CarPartsShop.API.Data;
using CarPartsShop.API.DTOs.Categories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarPartsShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        // GET: /api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var items = await _db.Categories
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET: /api/categories/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var cat = await _db.Categories
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();

            if (cat == null) return NotFound();
            return Ok(cat);
        }
    }
}
