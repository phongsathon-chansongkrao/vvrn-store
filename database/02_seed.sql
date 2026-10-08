/* =====================================================================
   VVRN - 02_seed.sql
   Sample catalog: 12 products (4 of them sold out), every color/size
   variant with its stock, and sample reviews. Run after 01_schema.sql.
   Heavyweight Tee / Black / M starts with 11 units.
   ===================================================================== */

USE VVRN;
GO

SET NOCOUNT ON;
BEGIN TRANSACTION;

-- Grid Shell Jacket
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('grid-shell-jacket', N'Grid Shell Jacket', 'jacket', 'Outerwear', 'outer', 4990.00, NULL, N'Water-repellent shell with reflective chevron tape that lights up under headlights. Two-way zip and a stand collar that seals out wind.', 1, 10);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Black', 'XS', 0, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Black', 'S', 0, 1, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Black', 'M', 0, 2, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Black', 'L', 0, 3, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Black', 'XL', 0, 4, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Graphite', 'XS', 1, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Graphite', 'S', 1, 1, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Graphite', 'M', 1, 2, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Graphite', 'L', 1, 3, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), 'Graphite', 'XL', 1, 4, 2);

-- Night Shift Hoodie
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('night-shift-hoodie', N'Night Shift Hoodie', 'hoodie', 'Tops', 'tops', 3290.00, NULL, N'460gsm brushed-back fleece with a deep double-layer hood. Boxy through the body, cropped slightly at the hem.', 1, 20);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Black', 'XS', 0, 0, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Black', 'S', 0, 1, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Black', 'M', 0, 2, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Black', 'L', 0, 3, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Black', 'XL', 0, 4, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Bone', 'XS', 1, 0, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Bone', 'S', 1, 1, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Bone', 'M', 1, 2, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Bone', 'L', 1, 3, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Bone', 'XL', 1, 4, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Olive', 'XS', 2, 0, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Olive', 'S', 2, 1, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Olive', 'M', 2, 2, 9),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Olive', 'L', 2, 3, 2),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), 'Olive', 'XL', 2, 4, 0);

-- Utility Vest
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('utility-vest', N'Utility Vest', 'vest', 'Outerwear', 'outer', 1500.00, 2500.00, N'Lightly padded vest for layering over a hoodie. Hidden chest pocket sized for a phone and transit card.', 0, 30);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Black', 'XS', 0, 0, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Black', 'S', 0, 1, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Black', 'M', 0, 2, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Black', 'L', 0, 3, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Black', 'XL', 0, 4, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Olive', 'XS', 1, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Olive', 'S', 1, 1, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Olive', 'M', 1, 2, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Olive', 'L', 1, 3, 7),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), 'Olive', 'XL', 1, 4, 7);

-- Transit Cargo Pant
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('transit-cargo-pant', N'Transit Cargo Pant', 'cargo', 'Bottoms', 'pants', 3890.00, NULL, N'Ripstop cargo with a tapered leg and drawcord cuffs. Bellows pockets sit flat until you fill them.', 0, 40);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Black', 'XS', 0, 0, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Black', 'S', 0, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Black', 'M', 0, 2, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Black', 'L', 0, 3, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Black', 'XL', 0, 4, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Graphite', 'XS', 1, 0, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Graphite', 'S', 1, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Graphite', 'M', 1, 2, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Graphite', 'L', 1, 3, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Graphite', 'XL', 1, 4, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Olive', 'XS', 2, 0, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Olive', 'S', 2, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Olive', 'M', 2, 2, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Olive', 'L', 2, 3, 8),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), 'Olive', 'XL', 2, 4, 8);

-- Heavyweight Tee
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('heavyweight-tee', N'Heavyweight Tee', 'tee', 'Tops', 'tops', 1490.00, NULL, N'300gsm cotton jersey that holds its shape. Dropped shoulder, ribbed collar, tonal VVRN mark on the chest.', 0, 50);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Black', 'XS', 0, 0, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Black', 'S', 0, 1, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Black', 'M', 0, 2, 11),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Black', 'L', 0, 3, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Black', 'XL', 0, 4, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Bone', 'XS', 1, 0, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Bone', 'S', 1, 1, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Bone', 'M', 1, 2, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Bone', 'L', 1, 3, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Bone', 'XL', 1, 4, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Graphite', 'XS', 2, 0, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Graphite', 'S', 2, 1, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Graphite', 'M', 2, 2, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Graphite', 'L', 2, 3, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Graphite', 'XL', 2, 4, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Amber', 'XS', 3, 0, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Amber', 'S', 3, 1, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Amber', 'M', 3, 2, 14),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Amber', 'L', 3, 3, 3),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), 'Amber', 'XL', 3, 4, 14);

-- Thermal Long Sleeve
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('thermal-long-sleeve', N'Thermal Long Sleeve', 'longsleeve', 'Tops', 'tops', 1990.00, 2490.00, N'Waffle-knit thermal for cold nights. Long cuffs with thumb room, close fit for wearing under a shell.', 0, 60);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Black', 'XS', 0, 0, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Black', 'S', 0, 1, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Black', 'M', 0, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Black', 'L', 0, 3, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Black', 'XL', 0, 4, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Bone', 'XS', 1, 0, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Bone', 'S', 1, 1, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Bone', 'M', 1, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Bone', 'L', 1, 3, 6),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), 'Bone', 'XL', 1, 4, 6);

-- Overpass Short
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('overpass-short', N'Overpass Short', 'shorts', 'Bottoms', 'shorts', 1990.00, NULL, N'Quick-dry nylon short with a 7-inch inseam, elastic waist and a zip back pocket.', 0, 70);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Black', 'XS', 0, 0, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Black', 'S', 0, 1, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Black', 'M', 0, 2, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Black', 'L', 0, 3, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Black', 'XL', 0, 4, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Graphite', 'XS', 1, 0, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Graphite', 'S', 1, 1, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Graphite', 'M', 1, 2, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Graphite', 'L', 1, 3, 10),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), 'Graphite', 'XL', 1, 4, 10);

-- Six-Panel Cap
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('six-panel-cap', N'Six-Panel Cap', 'cap', 'Accessories', 'cap', 1190.00, NULL, N'Unstructured cotton twill cap with an adjustable strap and embroidered VVRN mark.', 0, 80);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), 'Black', 'One size', 0, 0, 15),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), 'Bone', 'One size', 1, 0, 15),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), 'Amber', 'One size', 2, 0, 4);

-- Reflect Windbreaker
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('reflect-windbreaker', N'Reflect Windbreaker', 'jacket', 'Outerwear', 'outer', 4590.00, NULL, N'Packable ripstop windbreaker with full-length reflective piping. Folds into its own chest pocket.', 1, 90);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Black', 'XS', 0, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Black', 'S', 0, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Black', 'M', 0, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Black', 'L', 0, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Black', 'XL', 0, 4, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Bone', 'XS', 1, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Bone', 'S', 1, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Bone', 'M', 1, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Bone', 'L', 1, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), 'Bone', 'XL', 1, 4, 0);

-- Grid Graphic Tee
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('grid-graphic-tee', N'Grid Graphic Tee', 'tee', 'Tops', 'tops', 1290.00, NULL, N'Heavyweight tee with a puff-print grid graphic across the back. Same boxy block as the Heavyweight Tee.', 0, 100);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Black', 'XS', 0, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Black', 'S', 0, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Black', 'M', 0, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Black', 'L', 0, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Black', 'XL', 0, 4, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Bone', 'XS', 1, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Bone', 'S', 1, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Bone', 'M', 1, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Bone', 'L', 1, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), 'Bone', 'XL', 1, 4, 0);

-- Nylon Track Pant
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('nylon-track-pant', N'Nylon Track Pant', 'cargo', 'Bottoms', 'pants', 3290.00, NULL, N'Lined nylon track pant with ankle zips and a soft mesh waistband.', 0, 110);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Black', 'XS', 0, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Black', 'S', 0, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Black', 'M', 0, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Black', 'L', 0, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Black', 'XL', 0, 4, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Graphite', 'XS', 1, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Graphite', 'S', 1, 1, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Graphite', 'M', 1, 2, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Graphite', 'L', 1, 3, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), 'Graphite', 'XL', 1, 4, 0);

-- Signal Trucker Cap
INSERT INTO dbo.Products (Slug, Name, Type, Category, Guide, Price, CompareAtPrice, Description, IsLimited, SortOrder)
VALUES ('signal-trucker-cap', N'Signal Trucker Cap', 'cap', 'Accessories', 'cap', 990.00, NULL, N'Foam-front trucker with a mesh back and a reflective VVRN patch.', 0, 120);
INSERT INTO dbo.ProductVariants (ProductId, Color, Size, ColorOrder, SizeOrder, Stock) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), 'Black', 'One size', 0, 0, 0),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), 'Amber', 'One size', 1, 0, 0);

-- Sample reviews (UserId NULL = not tied to a real account)
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Bank R.', 4, N'Great shell. A bit warm for the afternoon, perfect after dark.', 'Graphite', 'XS', '2025-02-14 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Krit P.', 5, N'Fits boxy like the pictures. Took my usual size and it layers fine over a hoodie.', 'Black', 'S', '2025-04-17 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Fern T.', 3, N'Quality is good, but I wish the pockets were deeper.', 'Graphite', 'M', '2025-06-20 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Beam J.', 5, N'Got caught in a full downpour and stayed dry. Worth it.', 'Black', 'L', '2025-03-23 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Ploy N.', 4, N'Zip feels solid. Sleeves run a touch long for me.', 'Graphite', 'XL', '2025-05-26 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-shell-jacket'), NULL, N'Joy L.', 5, N'The reflective tape is legit. Cars actually give me space on night rides now.', 'Black', 'XS', '2025-02-02 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Gift A.', 5, N'Bought a second color the same week.', 'Olive', 'XS', '2025-02-06 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Arm K.', 5, N'Heavy fabric, doesn''t go see-through or lose shape after washing.', 'Black', 'S', '2025-04-09 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Pete M.', 4, N'Boxy fit as described. Sized down and it''s perfect.', 'Bone', 'M', '2025-06-12 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Ton W.', 5, N'Best blank I own. The tonal logo is subtle in a good way.', 'Olive', 'L', '2025-03-15 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Bank R.', 4, N'Color is exactly like the photos. Shrank maybe 1 cm after the first wash.', 'Black', 'XL', '2025-05-18 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shift-hoodie'), NULL, N'Krit P.', 3, N'Nice quality but too warm for daytime here.', 'Bone', 'XS', '2025-02-21 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), NULL, N'Joy L.', 5, N'Fits boxy like the pictures. Took my usual size and it layers fine over a hoodie.', 'Black', 'M', '2025-04-12 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), NULL, N'Mai S.', 3, N'Quality is good, but I wish the pockets were deeper.', 'Olive', 'L', '2025-06-15 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-vest'), NULL, N'Nat C.', 5, N'Got caught in a full downpour and stayed dry. Worth it.', 'Black', 'XL', '2025-03-18 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), NULL, N'Mai S.', 4, N'Fabric is tough. Waist runs slightly big, the belt loops help.', 'Graphite', 'XS', '2025-02-20 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), NULL, N'Nat C.', 5, N'Wear these four days a week. Still look new.', 'Olive', 'S', '2025-04-23 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), NULL, N'Gift A.', 4, N'Great fit, wish the inseam came in a shorter option.', 'Black', 'M', '2025-06-26 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'transit-cargo-pant'), NULL, N'Arm K.', 3, N'Good pants but the drawcords are a bit long.', 'Graphite', 'L', '2025-03-02 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Bank R.', 4, N'Boxy fit as described. Sized down and it''s perfect.', 'Amber', 'L', '2025-05-20 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Krit P.', 5, N'Best blank I own. The tonal logo is subtle in a good way.', 'Black', 'XL', '2025-02-23 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Fern T.', 4, N'Color is exactly like the photos. Shrank maybe 1 cm after the first wash.', 'Bone', 'XS', '2025-04-26 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Beam J.', 3, N'Nice quality but too warm for daytime here.', 'Graphite', 'S', '2025-06-02 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Ploy N.', 5, N'Bought a second color the same week.', 'Amber', 'M', '2025-03-05 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'heavyweight-tee'), NULL, N'Joy L.', 5, N'Heavy fabric, doesn''t go see-through or lose shape after washing.', 'Black', 'L', '2025-05-08 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), NULL, N'Joy L.', 5, N'Best blank I own. The tonal logo is subtle in a good way.', 'Black', 'M', '2025-04-15 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), NULL, N'Mai S.', 4, N'Color is exactly like the photos. Shrank maybe 1 cm after the first wash.', 'Bone', 'L', '2025-06-18 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'thermal-long-sleeve'), NULL, N'Nat C.', 3, N'Nice quality but too warm for daytime here.', 'Black', 'XL', '2025-03-21 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Ploy N.', 4, N'Light and comfortable. Color fades a little in the sun.', 'Graphite', 'L', '2025-05-19 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Joy L.', 5, N'Perfect for running errands, looks better than gym shorts.', 'Black', 'XL', '2025-02-22 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Mai S.', 3, N'Nice, but the waist is quite stretchy so they sit low.', 'Graphite', 'XS', '2025-04-25 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Nat C.', 5, N'Dries fast, zip pocket is clutch for keys.', 'Black', 'S', '2025-06-01 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Gift A.', 4, N'Good length, not too short. Elastic is comfy.', 'Graphite', 'M', '2025-03-04 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'overpass-short'), NULL, N'Arm K.', 5, N'My go-to for hot nights.', 'Black', 'L', '2025-05-07 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Gift A.', 3, N'Good quality but the strap buckle feels cheap.', 'Amber', 'One size', '2025-06-03 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Arm K.', 5, N'Fits my big head with room to spare on the strap.', 'Black', 'One size', '2025-03-06 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Pete M.', 4, N'Unstructured shape looks great worn in.', 'Bone', 'One size', '2025-05-09 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Ton W.', 5, N'Embroidery is clean. Goes with everything black.', 'Amber', 'One size', '2025-02-12 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Bank R.', 4, N'Nice cap, brim is a bit soft for my taste.', 'Black', 'One size', '2025-04-15 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'six-panel-cap'), NULL, N'Krit P.', 5, N'Bought it for the logo, kept it for the fit.', 'Bone', 'One size', '2025-06-18 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), NULL, N'Mai S.', 4, N'Great shell. A bit warm for the afternoon, perfect after dark.', 'Bone', 'XL', '2025-06-20 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), NULL, N'Nat C.', 5, N'Fits boxy like the pictures. Took my usual size and it layers fine over a hoodie.', 'Black', 'XS', '2025-03-23 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), NULL, N'Gift A.', 3, N'Quality is good, but I wish the pockets were deeper.', 'Bone', 'S', '2025-05-26 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'reflect-windbreaker'), NULL, N'Arm K.', 5, N'Got caught in a full downpour and stayed dry. Worth it.', 'Black', 'M', '2025-02-02 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Ploy N.', 4, N'Color is exactly like the photos. Shrank maybe 1 cm after the first wash.', 'Bone', 'M', '2025-04-25 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Joy L.', 3, N'Nice quality but too warm for daytime here.', 'Black', 'L', '2025-06-01 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Mai S.', 5, N'Bought a second color the same week.', 'Bone', 'XL', '2025-03-04 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Nat C.', 5, N'Heavy fabric, doesn''t go see-through or lose shape after washing.', 'Black', 'XS', '2025-05-07 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Gift A.', 4, N'Boxy fit as described. Sized down and it''s perfect.', 'Bone', 'S', '2025-02-10 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-graphic-tee'), NULL, N'Arm K.', 5, N'Best blank I own. The tonal logo is subtle in a good way.', 'Black', 'M', '2025-04-13 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), NULL, N'Fern T.', 5, N'Ripstop is the real deal, survived my bike chain.', 'Graphite', 'M', '2025-04-27 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), NULL, N'Beam J.', 5, N'Tapered just right, cuffs stay put. Pockets hold a lot without bulging.', 'Black', 'L', '2025-06-03 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), NULL, N'Ploy N.', 4, N'Fabric is tough. Waist runs slightly big, the belt loops help.', 'Graphite', 'XL', '2025-03-06 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'nylon-track-pant'), NULL, N'Joy L.', 5, N'Wear these four days a week. Still look new.', 'Black', 'XS', '2025-05-09 10:00:00');
INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Bank R.', 4, N'Unstructured shape looks great worn in.', 'Amber', 'One size', '2025-05-23 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Krit P.', 5, N'Embroidery is clean. Goes with everything black.', 'Black', 'One size', '2025-02-26 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Fern T.', 4, N'Nice cap, brim is a bit soft for my taste.', 'Amber', 'One size', '2025-04-02 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Beam J.', 5, N'Bought it for the logo, kept it for the fit.', 'Black', 'One size', '2025-06-05 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Ploy N.', 3, N'Good quality but the strap buckle feels cheap.', 'Amber', 'One size', '2025-03-08 10:00:00'),
  ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-trucker-cap'), NULL, N'Joy L.', 5, N'Fits my big head with room to spare on the strap.', 'Black', 'One size', '2025-05-11 10:00:00');

-- Sample products are not new: date them 30 days ago, keeping SortOrder as newest-first order
UPDATE dbo.Products SET CreatedAt = DATEADD(MINUTE, -SortOrder, DATEADD(DAY, -30, SYSUTCDATETIME()));

INSERT INTO dbo.DiscountCodes (Code, PercentOff, OnePerAccount) VALUES ('VVRN10', 10, 1);

INSERT INTO dbo.SiteSettings ([Key], Value)
VALUES ('promo_bar', N'{"enabled":true,"messages":["SS25 Drop 001","Limited to 200 units","Free worldwide shipping"]}');

COMMIT TRANSACTION;
GO

-- Quick check
SELECT p.Name, v.Color, v.Size, v.Stock
FROM dbo.ProductVariants v JOIN dbo.Products p ON p.Id = v.ProductId
WHERE p.Slug = 'heavyweight-tee' AND v.Color = 'Black' AND v.Size = 'M';
GO
