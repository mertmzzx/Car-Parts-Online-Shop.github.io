# Use the official ASP.NET runtime as a base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 443

# Build stage with SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["CarPartsShop.API/CarPartsShop.API.csproj", "CarPartsShop.API/"]
RUN dotnet restore "CarPartsShop.API/CarPartsShop.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/CarPartsShop.API"
RUN dotnet build "CarPartsShop.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "CarPartsShop.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CarPartsShop.API.dll"]
