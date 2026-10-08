/* =====================================================================
   VVRN - 10_more_products.sql
   21 more products: shirts, tanks, jeans, slacks, shoes, belts,
   3 eyewear styles, ties and socks. Each product is skipped if its slug
   already exists, so this is safe to run again.
   Needs the new types/colors/sizes in the code (Garment.tsx, data.ts,
   backend schemas.ts). Shown in the shop straight away and marked NEW
   (CreatedAt = now) for 3 days.
   ===================================================================== */

USE VVRN;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- Oxford Shirt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'oxford-shirt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('oxford-shirt', N'Oxford Shirt', 'shirt', 'Tops', 'tops', 2290.00, NULL, N'Heavy cotton oxford with a button-down collar and one chest pocket. Cut slightly boxy so it works tucked or open over a tee.', 0, 200,
          DATEADD(MINUTE, -0, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Bone', 'XS', 0, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Bone', 'S', 0, 1, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Bone', 'M', 0, 2, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Bone', 'L', 0, 3, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Bone', 'XL', 0, 4, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Black', 'XS', 1, 0, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Black', 'S', 1, 1, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Black', 'M', 1, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Black', 'L', 1, 3, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Black', 'XL', 1, 4, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Indigo', 'XS', 2, 0, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Indigo', 'S', 2, 1, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Indigo', 'M', 2, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Indigo', 'L', 2, 3, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), 'Indigo', 'XL', 2, 4, 15);
END

-- Night Market Overshirt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'night-market-overshirt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('night-market-overshirt', N'Night Market Overshirt', 'shirt', 'Tops', 'tops', 2690.00, 3290.00, N'Brushed twill overshirt with snap-style buttons. Wear it as a shirt or a light jacket on cooler nights.', 0, 210,
          DATEADD(MINUTE, -1, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Olive', 'XS', 0, 0, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Olive', 'S', 0, 1, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Olive', 'M', 0, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Olive', 'L', 0, 3, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Olive', 'XL', 0, 4, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Khaki', 'XS', 1, 0, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Khaki', 'S', 1, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Khaki', 'M', 1, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Khaki', 'L', 1, 3, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Khaki', 'XL', 1, 4, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Black', 'XS', 2, 0, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Black', 'S', 2, 1, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Black', 'M', 2, 2, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Black', 'L', 2, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), 'Black', 'XL', 2, 4, 12);
END

-- Camp Collar Shirt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'camp-collar-shirt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('camp-collar-shirt', N'Camp Collar Shirt', 'shirt-ss', 'Tops', 'tops', 1890.00, NULL, N'Relaxed short-sleeve shirt with an open camp collar. Fluid viscose blend that stays cool in the heat.', 0, 220,
          DATEADD(MINUTE, -2, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Black', 'XS', 0, 0, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Black', 'S', 0, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Black', 'M', 0, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Black', 'L', 0, 3, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Black', 'XL', 0, 4, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Bone', 'XS', 1, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Bone', 'S', 1, 1, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Bone', 'M', 1, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Bone', 'L', 1, 3, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Bone', 'XL', 1, 4, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Olive', 'XS', 2, 0, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Olive', 'S', 2, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Olive', 'M', 2, 2, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Olive', 'L', 2, 3, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), 'Olive', 'XL', 2, 4, 8);
END

-- Grid Boxy Shirt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'grid-boxy-shirt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('grid-boxy-shirt', N'Grid Boxy Shirt', 'shirt-ss', 'Tops', 'tops', 1690.00, NULL, N'Cropped, boxy short-sleeve shirt with a tonal grid weave. Limited run for Drop 001.', 1, 230,
          DATEADD(MINUTE, -3, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'Graphite', 'XS', 0, 0, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'Graphite', 'S', 0, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'Graphite', 'M', 0, 2, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'Graphite', 'L', 0, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'Graphite', 'XL', 0, 4, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'White', 'XS', 1, 0, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'White', 'S', 1, 1, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'White', 'M', 1, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'White', 'L', 1, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), 'White', 'XL', 1, 4, 11);
END

-- Rib Tank
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'rib-tank')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('rib-tank', N'Rib Tank', 'tank', 'Tops', 'tops', 690.00, NULL, N'Fine-rib cotton tank with a scooped neck. The layer under everything.', 0, 240,
          DATEADD(MINUTE, -4, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Black', 'XS', 0, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Black', 'S', 0, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Black', 'M', 0, 2, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Black', 'L', 0, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Black', 'XL', 0, 4, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'White', 'XS', 1, 0, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'White', 'S', 1, 1, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'White', 'M', 1, 2, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'White', 'L', 1, 3, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'White', 'XL', 1, 4, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Graphite', 'XS', 2, 0, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Graphite', 'S', 2, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Graphite', 'M', 2, 2, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Graphite', 'L', 2, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), 'Graphite', 'XL', 2, 4, 15);
END

-- Utility Tank
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'utility-tank')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('utility-tank', N'Utility Tank', 'tank', 'Tops', 'tops', 790.00, 990.00, N'Heavyweight jersey tank with a small chest logo and a slightly longer hem.', 0, 250,
          DATEADD(MINUTE, -5, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Olive', 'XS', 0, 0, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Olive', 'S', 0, 1, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Olive', 'M', 0, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Olive', 'L', 0, 3, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Olive', 'XL', 0, 4, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Black', 'XS', 1, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Black', 'S', 1, 1, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Black', 'M', 1, 2, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Black', 'L', 1, 3, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), 'Black', 'XL', 1, 4, 8);
END

-- Straight Jeans
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'straight-jeans')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('straight-jeans', N'Straight Jeans', 'jeans', 'Bottoms', 'pants', 2890.00, NULL, N'13.5 oz rigid denim in a straight leg. Breaks in to your shape over the first few weeks.', 0, 260,
          DATEADD(MINUTE, -6, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Indigo', 'XS', 0, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Indigo', 'S', 0, 1, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Indigo', 'M', 0, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Indigo', 'L', 0, 3, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Indigo', 'XL', 0, 4, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Black', 'XS', 1, 0, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Black', 'S', 1, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Black', 'M', 1, 2, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Black', 'L', 1, 3, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), 'Black', 'XL', 1, 4, 12);
END

-- Washed Loose Jeans
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'washed-loose-jeans')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('washed-loose-jeans', N'Washed Loose Jeans', 'jeans', 'Bottoms', 'pants', 3190.00, NULL, N'Loose fit with a stone-washed finish and a stacked hem. Limited wash, not coming back.', 1, 270,
          DATEADD(MINUTE, -7, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Indigo', 'XS', 0, 0, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Indigo', 'S', 0, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Indigo', 'M', 0, 2, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Indigo', 'L', 0, 3, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Indigo', 'XL', 0, 4, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Graphite', 'XS', 1, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Graphite', 'S', 1, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Graphite', 'M', 1, 2, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Graphite', 'L', 1, 3, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), 'Graphite', 'XL', 1, 4, 8);
END

-- Pleated Slacks
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'pleated-slacks')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('pleated-slacks', N'Pleated Slacks', 'slacks', 'Bottoms', 'pants', 2490.00, NULL, N'Single-pleat wide-leg trousers with a sharp front crease. Dress them up or wear them with sneakers.', 0, 280,
          DATEADD(MINUTE, -8, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Black', 'XS', 0, 0, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Black', 'S', 0, 1, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Black', 'M', 0, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Black', 'L', 0, 3, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Black', 'XL', 0, 4, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Graphite', 'XS', 1, 0, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Graphite', 'S', 1, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Graphite', 'M', 1, 2, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Graphite', 'L', 1, 3, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Graphite', 'XL', 1, 4, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Khaki', 'XS', 2, 0, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Khaki', 'S', 2, 1, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Khaki', 'M', 2, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Khaki', 'L', 2, 3, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), 'Khaki', 'XL', 2, 4, 0);
END

-- Tapered Slacks
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'tapered-slacks')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('tapered-slacks', N'Tapered Slacks', 'slacks', 'Bottoms', 'pants', 2290.00, 2790.00, N'Clean tapered trousers with a stretch waistband at the back. Office to night without changing.', 0, 290,
          DATEADD(MINUTE, -9, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Black', 'XS', 0, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Black', 'S', 0, 1, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Black', 'M', 0, 2, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Black', 'L', 0, 3, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Black', 'XL', 0, 4, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Bone', 'XS', 1, 0, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Bone', 'S', 1, 1, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Bone', 'M', 1, 2, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Bone', 'L', 1, 3, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), 'Bone', 'XL', 1, 4, 0);
END

-- Grid Runner
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'grid-runner')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('grid-runner', N'Grid Runner', 'shoes', 'Footwear', 'shoes', 4590.00, NULL, N'Low-profile runner with a reflective heel tab and a cushioned sole. Built for long nights on concrete.', 1, 300,
          DATEADD(MINUTE, -10, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '40', 0, 8, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '41', 0, 9, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '42', 0, 10, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '43', 0, 11, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '44', 0, 12, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'Black', '45', 0, 13, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '40', 1, 8, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '41', 1, 9, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '42', 1, 10, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '43', 1, 11, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '44', 1, 12, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), 'White', '45', 1, 13, 15);
END

-- Court Low
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'court-low')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('court-low', N'Court Low', 'shoes', 'Footwear', 'shoes', 3890.00, NULL, N'Leather court sneaker with a cupsole. The everyday pair.', 0, 310,
          DATEADD(MINUTE, -11, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '40', 0, 8, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '41', 0, 9, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '42', 0, 10, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '43', 0, 11, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '44', 0, 12, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'White', '45', 0, 13, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '40', 1, 8, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '41', 1, 9, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '42', 1, 10, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '43', 1, 11, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '44', 1, 12, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Bone', '45', 1, 13, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '40', 2, 8, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '41', 2, 9, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '42', 2, 10, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '43', 2, 11, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '44', 2, 12, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), 'Black', '45', 2, 13, 8);
END

-- Buckle Belt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'buckle-belt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('buckle-belt', N'Buckle Belt', 'belt', 'Accessories', 'belt', 990.00, NULL, N'Full-grain leather belt with a matte gunmetal buckle. 3.5 cm wide.', 0, 320,
          DATEADD(MINUTE, -12, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Black', 'S', 0, 1, 10),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Black', 'M', 0, 2, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Black', 'L', 0, 3, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Black', 'XL', 0, 4, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Tortoise', 'S', 1, 1, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Tortoise', 'M', 1, 2, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Tortoise', 'L', 1, 3, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), 'Tortoise', 'XL', 1, 4, 11);
END

-- Webbing Belt
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'webbing-belt')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('webbing-belt', N'Webbing Belt', 'belt', 'Accessories', 'belt', 790.00, NULL, N'Nylon webbing belt with a quick-release metal buckle. Cut to fit.', 0, 330,
          DATEADD(MINUTE, -13, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Black', 'S', 0, 1, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Black', 'M', 0, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Black', 'L', 0, 3, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Black', 'XL', 0, 4, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Khaki', 'S', 1, 1, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Khaki', 'M', 1, 2, 0),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Khaki', 'L', 1, 3, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Khaki', 'XL', 1, 4, 11),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Olive', 'S', 2, 1, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Olive', 'M', 2, 2, 8),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Olive', 'L', 2, 3, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), 'Olive', 'XL', 2, 4, 0);
END

-- Night Shades Sunglasses
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'night-shades')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('night-shades', N'Night Shades Sunglasses', 'shades', 'Accessories', 'eyewear', 1890.00, NULL, N'Thick acetate frame with dark UV400 lenses. Comes with a hard case.', 1, 340,
          DATEADD(MINUTE, -14, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shades'), 'Black', 'One size', 0, 5, 27),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shades'), 'Tortoise', 'One size', 1, 5, 26);
END

-- Round Frame Glasses
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'round-frame-glasses')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('round-frame-glasses', N'Round Frame Glasses', 'round', 'Accessories', 'eyewear', 1590.00, NULL, N'Round acetate optical frame with clear demo lenses. Take it to any optician for your prescription.', 0, 350,
          DATEADD(MINUTE, -15, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), 'Tortoise', 'One size', 0, 5, 35),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), 'Black', 'One size', 1, 5, 37),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), 'Amber', 'One size', 2, 5, 22);
END

-- Aviator Sunglasses
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'aviator-sunglasses')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('aviator-sunglasses', N'Aviator Sunglasses', 'aviator', 'Accessories', 'eyewear', 1990.00, 2390.00, N'Thin metal aviator frame with a double bridge and gradient UV400 lenses.', 0, 360,
          DATEADD(MINUTE, -16, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'aviator-sunglasses'), 'Amber', 'One size', 0, 5, 24),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'aviator-sunglasses'), 'Graphite', 'One size', 1, 5, 22);
END

-- Signal Tie
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'signal-tie')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('signal-tie', N'Signal Tie', 'tie', 'Accessories', 'tie', 890.00, NULL, N'Slim 7 cm tie in a matte silk blend with a tonal diagonal stripe.', 0, 370,
          DATEADD(MINUTE, -17, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-tie'), 'Black', 'One size', 0, 5, 33),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-tie'), 'Amber', 'One size', 1, 5, 26),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-tie'), 'Olive', 'One size', 2, 5, 30);
END

-- Knit Tie
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'knit-tie')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('knit-tie', N'Knit Tie', 'tie', 'Accessories', 'tie', 790.00, NULL, N'Squared-off knit tie with texture. Easy to tie, hard to wrinkle.', 0, 380,
          DATEADD(MINUTE, -18, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'knit-tie'), 'Black', 'One size', 0, 5, 39),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'knit-tie'), 'Indigo', 'One size', 1, 5, 24),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'knit-tie'), 'Bone', 'One size', 2, 5, 33);
END

-- Crew Socks (2-pack)
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'crew-socks')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('crew-socks', N'Crew Socks (2-pack)', 'socks', 'Accessories', 'socks', 390.00, NULL, N'Two pairs of ribbed cotton crew socks with a cushioned sole.', 0, 390,
          DATEADD(MINUTE, -19, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'White', '39-42', 0, 6, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'White', '43-46', 0, 7, 13),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'Black', '39-42', 1, 6, 14),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'Black', '43-46', 1, 7, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'Graphite', '39-42', 2, 6, 12),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), 'Graphite', '43-46', 2, 7, 0);
END

-- Logo Socks
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'logo-socks')
BEGIN
  INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder, CreatedAt)
  VALUES ('logo-socks', N'Logo Socks', 'socks', 'Accessories', 'socks', 450.00, NULL, N'Mid-calf socks with a knitted VVRN logo. One pair.', 0, 400,
          DATEADD(MINUTE, -20, SYSUTCDATETIME()));
  INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), 'Black', '39-42', 0, 6, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), 'Black', '43-46', 0, 7, 15),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), 'Amber', '39-42', 1, 6, 9),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), 'Amber', '43-46', 1, 7, 10);
END

COMMIT TRANSACTION;
GO
