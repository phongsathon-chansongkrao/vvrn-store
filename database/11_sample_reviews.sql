/* =====================================================================
   VVRN - 11_sample_reviews.sql
   SAMPLE reviews for the products added in 10_more_products.sql.
   They are written by us, not by customers: UserId is NULL, like the
   sample reviews in 02_seed.sql.
   !! Delete ALL sample reviews before the shop goes live:
        DELETE FROM dbo.Reviews WHERE UserId IS NULL;
   Each product is skipped if it already has sample reviews, so this is
   safe to run again.
   ===================================================================== */

USE VVRN;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'oxford-shirt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'oxford-shirt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), NULL, N'Nut S.', 5, N'Thick oxford that actually holds its shape. Looks sharp tucked into slacks.', 'Bone', 'M', DATEADD(MINUTE, -67, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), NULL, N'Ploy C.', 4, N'Runs a little boxy. I sized down to S and it''s perfect.', 'Indigo', 'S', DATEADD(MINUTE, -104, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'oxford-shirt'), NULL, N'Tae K.', 5, N'Wore it open over a tank all weekend. The collar stays crisp after washing.', 'Black', 'L', DATEADD(MINUTE, -141, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'night-market-overshirt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'night-market-overshirt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), NULL, N'Bas N.', 5, N'Works as a light jacket on cool nights. The brushed twill feels great.', 'Olive', 'M', DATEADD(MINUTE, -178, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), NULL, N'June P.', 4, N'Nice weight. Sleeves are a touch long on me but I just roll them.', 'Khaki', 'S', DATEADD(MINUTE, -215, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), NULL, N'Ohm T.', 5, N'Got it on sale and it''s easily the best value thing I own.', 'Black', 'L', DATEADD(MINUTE, -252, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-market-overshirt'), NULL, N'Mint R.', 4, N'Layers well over a hoodie. Wish it had one more inside pocket.', 'Olive', 'XL', DATEADD(MINUTE, -289, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'camp-collar-shirt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'camp-collar-shirt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), NULL, N'Golf W.', 5, N'So light in the heat. The camp collar sits flat without ironing.', 'Black', 'M', DATEADD(MINUTE, -326, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), NULL, N'Fah S.', 4, N'Fabric drapes nicely. Slightly see-through in Bone, so wear something under.', 'Bone', 'S', DATEADD(MINUTE, -363, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'camp-collar-shirt'), NULL, N'Boss L.', 5, N'Bought the Olive after the Black. Fits relaxed but not sloppy.', 'Olive', 'L', DATEADD(MINUTE, -400, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'grid-boxy-shirt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'grid-boxy-shirt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), NULL, N'Jay M.', 5, N'The tonal grid only shows up in the light. Really nice detail.', 'Graphite', 'M', DATEADD(MINUTE, -437, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-boxy-shirt'), NULL, N'Pang A.', 4, N'Short and boxy as described. Size up if you like it longer.', 'White', 'S', DATEADD(MINUTE, -474, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'rib-tank')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'rib-tank' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), NULL, N'Toon B.', 5, N'Perfect under shirts. Doesn''t stretch out at the arms after washing.', 'White', 'M', DATEADD(MINUTE, -511, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), NULL, N'Mai K.', 4, N'Fine rib, good length. Bought three.', 'Black', 'S', DATEADD(MINUTE, -548, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'rib-tank'), NULL, N'Win P.', 5, N'Fits close without being tight. My new base layer.', 'Graphite', 'L', DATEADD(MINUTE, -585, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'utility-tank')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'utility-tank' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), NULL, N'Kong J.', 4, N'Heavier jersey than most tanks. Great for the gym too.', 'Olive', 'L', DATEADD(MINUTE, -22, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'utility-tank'), NULL, N'Nam S.', 5, N'The longer hem is great. Doesn''t ride up.', 'Black', 'M', DATEADD(MINUTE, -59, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'straight-jeans')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'straight-jeans' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), NULL, N'Dome R.', 5, N'Stiff at first, like real raw denim should be. Two weeks in and it fits like it was made for me.', 'Indigo', 'M', DATEADD(MINUTE, -96, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), NULL, N'Ice T.', 4, N'Straight leg is exactly right. Waist runs a bit small, size up if you''re between.', 'Black', 'L', DATEADD(MINUTE, -133, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), NULL, N'Pan W.', 5, N'Black stays black after a few washes. Good hardware too.', 'Black', 'S', DATEADD(MINUTE, -170, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'straight-jeans'), NULL, N'Ken C.', 4, N'Classic fit. I''d love a slightly shorter inseam option.', 'Indigo', 'XL', DATEADD(MINUTE, -207, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'washed-loose-jeans')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'washed-loose-jeans' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), NULL, N'Mew L.', 5, N'The wash is perfect and the stack at the hem looks great with the Court Low.', 'Indigo', 'M', DATEADD(MINUTE, -244, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), NULL, N'Art S.', 4, N'Very loose, like it says. Took my normal size.', 'Graphite', 'L', DATEADD(MINUTE, -281, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'washed-loose-jeans'), NULL, N'Nong B.', 5, N'Grabbed one before the limited run sold out. No regrets.', 'Indigo', 'S', DATEADD(MINUTE, -318, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'pleated-slacks')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'pleated-slacks' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), NULL, N'Book P.', 5, N'The crease stays sharp all day. Wore them to work and out after.', 'Black', 'M', DATEADD(MINUTE, -355, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), NULL, N'Earth K.', 4, N'Wide leg is flattering. Khaki is lighter than it looks on screen.', 'Khaki', 'L', DATEADD(MINUTE, -392, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'pleated-slacks'), NULL, N'Fon D.', 5, N'Look dressy but feel like sweatpants. Getting the Graphite next.', 'Graphite', 'S', DATEADD(MINUTE, -429, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'tapered-slacks')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'tapered-slacks' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), NULL, N'Pond T.', 4, N'Stretch waistband at the back is a lifesaver after lunch.', 'Black', 'M', DATEADD(MINUTE, -466, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'tapered-slacks'), NULL, N'Rin S.', 5, N'Clean taper, sits right on my sneakers. Worth it on sale.', 'Bone', 'S', DATEADD(MINUTE, -503, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'grid-runner')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'grid-runner' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), NULL, N'Max N.', 5, N'Super comfortable on long walks. The reflective heel tab is a nice touch at night.', 'Black', '42', DATEADD(MINUTE, -540, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), NULL, N'Pim W.', 4, N'True to size for me. Took a couple of days to break in.', 'White', '41', DATEADD(MINUTE, -577, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), NULL, N'Top A.', 5, N'Light and the cushioning is great. White gets dirty fast, obviously.', 'White', '43', DATEADD(MINUTE, -14, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'grid-runner'), NULL, N'Guy R.', 5, N'Best runner I''ve owned. Already eyeing a second pair.', 'Black', '44', DATEADD(MINUTE, -51, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'court-low')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'court-low' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), NULL, N'Bell K.', 5, N'Simple, clean, goes with everything. Leather is soft from day one.', 'White', '42', DATEADD(MINUTE, -88, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), NULL, N'Ton P.', 4, N'Runs half a size big. I went down one and they''re perfect.', 'Bone', '43', DATEADD(MINUTE, -125, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'court-low'), NULL, N'Aom S.', 5, N'My everyday pair now. The Black looks great with slacks.', 'Black', '41', DATEADD(MINUTE, -162, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'buckle-belt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'buckle-belt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), NULL, N'Kai T.', 5, N'Solid leather, matte buckle doesn''t scratch easily.', 'Black', 'M', DATEADD(MINUTE, -199, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'buckle-belt'), NULL, N'Lek W.', 4, N'Tortoise is more of a warm brown. Looks good with Khaki slacks.', 'Tortoise', 'L', DATEADD(MINUTE, -236, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'webbing-belt')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'webbing-belt' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), NULL, N'Bank S.', 5, N'Quick-release buckle is so convenient. Cut it to length in a minute.', 'Black', 'M', DATEADD(MINUTE, -273, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), NULL, N'Praew N.', 4, N'Light and strong. The Olive matches the Utility Tank perfectly.', 'Olive', 'S', DATEADD(MINUTE, -310, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'webbing-belt'), NULL, N'Joe K.', 4, N'Good belt for the price. Webbing feels sturdy.', 'Khaki', 'L', DATEADD(MINUTE, -347, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'night-shades')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'night-shades' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shades'), NULL, N'Film B.', 5, N'Thick frame, dark lenses, very good case. Feels premium.', 'Black', 'One size', DATEADD(MINUTE, -384, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shades'), NULL, N'Nat R.', 4, N'Fits my wide face well. A bit heavy on the nose after a few hours.', 'Tortoise', 'One size', DATEADD(MINUTE, -421, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'night-shades'), NULL, N'Beam S.', 5, N'Got so many compliments. Glad I got one before they sell out.', 'Black', 'One size', DATEADD(MINUTE, -458, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'round-frame-glasses')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'round-frame-glasses' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), NULL, N'Pear L.', 5, N'My optician fitted my prescription with no problems. Light and comfortable.', 'Tortoise', 'One size', DATEADD(MINUTE, -495, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), NULL, N'Mon T.', 4, N'Nice frame. The Amber is brighter than I expected but I like it.', 'Amber', 'One size', DATEADD(MINUTE, -532, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'round-frame-glasses'), NULL, N'Jane K.', 5, N'Wearing them every day. They fit better than my old pair.', 'Black', 'One size', DATEADD(MINUTE, -569, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'aviator-sunglasses')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'aviator-sunglasses' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'aviator-sunglasses'), NULL, N'Ball W.', 5, N'Thin metal frame is light but feels solid. Gradient lenses are great for driving.', 'Amber', 'One size', DATEADD(MINUTE, -6, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'aviator-sunglasses'), NULL, N'Chompoo S.', 4, N'Classic shape. Nose pads could be a little softer.', 'Graphite', 'One size', DATEADD(MINUTE, -43, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'signal-tie')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'signal-tie' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-tie'), NULL, N'Neung P.', 5, N'Matte finish looks expensive. The stripe only shows up in the light.', 'Black', 'One size', DATEADD(MINUTE, -80, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'signal-tie'), NULL, N'Tum K.', 4, N'Slim width is perfect for my suits. The Amber one is a fun accent.', 'Amber', 'One size', DATEADD(MINUTE, -117, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'knit-tie')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'knit-tie' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'knit-tie'), NULL, N'Ake R.', 5, N'Knit ties are underrated. This one ties a neat small knot.', 'Indigo', 'One size', DATEADD(MINUTE, -154, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'knit-tie'), NULL, N'Ning S.', 4, N'Great texture. Bone looks good with the Black Oxford.', 'Bone', 'One size', DATEADD(MINUTE, -191, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'crew-socks')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'crew-socks' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), NULL, N'Pop T.', 5, N'Thick cushioned sole, holds up well after many washes.', 'White', '39-42', DATEADD(MINUTE, -228, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), NULL, N'Ham B.', 4, N'Good everyday socks. Wish the pack had three pairs.', 'Black', '43-46', DATEADD(MINUTE, -265, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'crew-socks'), NULL, N'Yui K.', 5, N'Ribbed cuff stays up all day. Already reordered.', 'Graphite', '39-42', DATEADD(MINUTE, -302, SYSUTCDATETIME()));

IF EXISTS (SELECT 1 FROM dbo.Products WHERE Slug = 'logo-socks')
   AND NOT EXISTS (SELECT 1 FROM dbo.Reviews r JOIN dbo.Products p ON p.Id = r.ProductId WHERE p.Slug = 'logo-socks' AND r.UserId IS NULL)
  INSERT INTO dbo.Reviews (ProductId, UserId, AuthorName, Rating, Comment, Color, Size, CreatedAt) VALUES
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), NULL, N'Ou M.', 5, N'The knitted logo is a nice detail. Amber looks great with black shoes.', 'Amber', '43-46', DATEADD(MINUTE, -339, SYSUTCDATETIME())),
    ((SELECT Id FROM dbo.Products WHERE Slug = 'logo-socks'), NULL, N'Jib S.', 4, N'Comfortable mid-calf length. Just one pair per pack though.', 'Black', '39-42', DATEADD(MINUTE, -376, SYSUTCDATETIME()));

COMMIT TRANSACTION;
GO
