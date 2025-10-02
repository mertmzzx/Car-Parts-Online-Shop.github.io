# CarPartsShop.API/Dockerfile

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1) Copy only the csproj and restore first (faster, better cache)
COPY CarPartsShop.API/CarPartsShop.API.csproj ./CarPartsShop.API/
RUN dotnet restore ./CarPartsShop.API/CarPartsShop.API.csproj

# 2) Copy the rest of the project
COPY CarPartsShop.API/ ./CarPartsShop.API/

# 3) Publish
WORKDIR /src/CarPartsShop.API
RUN dotnet publish CarPartsShop.API.csproj -c Release -o /out /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "CarPartsShop.API.dll"]
