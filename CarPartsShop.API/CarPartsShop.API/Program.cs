using System.Text;
using CarPartsShop.API.Auth;                 // Roles constants 
using CarPartsShop.API.Data;                 // AppDbContext 
using CarPartsShop.API.Models.Identity;      // AppUser/AppRole
using CarPartsShop.API.Services;             // JwtTokenService 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1) DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2) Identity (AppUser/AppRole with int keys)
builder.Services
    .AddIdentityCore<AppUser>(opt =>
    {
        // Dev-friendly rules; safe for local only
        opt.User.RequireUniqueEmail = true;
        opt.Password.RequiredLength = 8;
        opt.Password.RequireDigit = true;
        opt.Password.RequireUppercase = false;
        opt.Password.RequireLowercase = true;
        opt.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<AppRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager<SignInManager<AppUser>>();

// 3) JWT authentication
var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

// 4) Authorization policies for your 3 roles
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", p => p.RequireRole(Roles.Administrator));
    options.AddPolicy("ManageOrders", p => p.RequireRole(Roles.SalesAssistant, Roles.Administrator));
    options.AddPolicy("ManageCatalog", p => p.RequireRole(Roles.Administrator));
});

// 5) CORS for your dev frontends
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000") 
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("X-Total-Count");
    });
    opt.AddPolicy("FrontEnd", p => p
        .WithOrigins("https://mertmzzx.github.io", "https://mertmzzx.github.io/Car-Parts-Online-Shop.github.io")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CarPartsShop API", Version = "v1" });

    // Enable JWT support
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// 6) Token service (used by AuthController)
builder.Services.AddScoped<JwtTokenService>();
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Order of middleware matters:
app.UseCors(app.Environment.IsDevelopment() ? "DevCors" : "FrontEnd");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.Services.SeedAsync(builder.Configuration);

app.Run();
