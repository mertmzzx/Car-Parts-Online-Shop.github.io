# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

# Build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy just the csproj and restore (note the *double* folder)
COPY CarPartsShop.API/CarPartsShop.API/CarPartsShop.API.csproj ./CarPartsShop.API/
RUN dotnet restore ./CarPartsShop.API/CarPartsShop.API.csproj

# Copy the rest of the API project (outer folder into /src/CarPartsShop.API/)
COPY CarPartsShop.API/ ./CarPartsShop.API/

# Publish
WORKDIR /src/CarPartsShop.API
RUN dotnet publish CarPartsShop.API.csproj -c Release -o /out /p:UseAppHost=false

# Final image
FROM base AS final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "CarPartsShop.API.dll"]
