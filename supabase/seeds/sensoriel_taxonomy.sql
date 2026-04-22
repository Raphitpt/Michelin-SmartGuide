-- supabase/seeds/sensoriel_taxonomy.sql
-- ============================================================
-- DONNÉES DÉJÀ EN BASE (ne pas réinsérer) :
--   - reco_dimensions : D1 à D7 déjà présentes
--   - reco_traits     : 110 traits déjà présents
--   - reco_archetypes : gourmet, terroir, explorer, naturel, carnivore, marin
--   - reco_archetype_weights : 40 poids déjà configurés
--
-- CE SEED fait uniquement :
--   Associer 15 restaurants existants à des traits (restaurant_traits)
--   pour que le parcours sensoriel puisse swiper des restaurants réels.
--
-- Restaurants sélectionnés : variété de styles, d'origines, d'awards.
-- Codes de traits utilisés : ceux existants en base (voir reco_traits).
-- ============================================================

-- Michelin awards IDs (pour référence) :
--   ONE_STAR     : 17db12b6-92d6-4895-8397-36ebedee7c72
--   TWO_STARS    : e215cc58-5bf6-4218-87c0-a800c6e87622
--   THREE_STARS  : 80c73601-bb29-4ee9-b579-8537c54a4213
--   BIB_GOURMAND : 43113ea1-ed76-4653-8148-ed8fa48739f5
--   MICHELIN_PLATE: 97b5b169-4b3a-4c51-a552-96860528d269

-- ============================================================
-- 114 Faubourg — Paris, 1 étoile — Gastronomique français classique
-- → gourmet & terroir
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('93bf24f0-7158-4868-a4cf-f8f15e829f85', 'style.GASTRO'),
  ('93bf24f0-7158-4868-a4cf-f8f15e829f85', 'cuisine.FR_CLASSIC'),
  ('93bf24f0-7158-4868-a4cf-f8f15e829f85', 'price.XL'),
  ('93bf24f0-7158-4868-a4cf-f8f15e829f85', 'ctx.SPECIAL'),
  ('93bf24f0-7158-4868-a4cf-f8f15e829f85', 'cat.STARRED')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 100 Mahaseth — Bangkok, Michelin Plate — Viandes grillées, Asie
-- → carnivore & explorer
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('7875162a-f22f-4332-b293-7012b5799566', 'prod.RED_MEAT'),
  ('7875162a-f22f-4332-b293-7012b5799566', 'sense.GRILLED'),
  ('7875162a-f22f-4332-b293-7012b5799566', 'sense.BOLD'),
  ('7875162a-f22f-4332-b293-7012b5799566', 'sense.SPICY'),
  ('7875162a-f22f-4332-b293-7012b5799566', 'price.M'),
  ('7875162a-f22f-4332-b293-7012b5799566', 'ctx.FRIENDS')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 100 Maneiras — Lisbonne, Michelin Plate — Fusion contemporaine
-- → gourmet & explorer
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('69a66be6-1041-4425-855f-1e27e3f27636', 'style.FUSION'),
  ('69a66be6-1041-4425-855f-1e27e3f27636', 'cuisine.FR_CONTEMP'),
  ('69a66be6-1041-4425-855f-1e27e3f27636', 'sense.ACID'),
  ('69a66be6-1041-4425-855f-1e27e3f27636', 'price.L'),
  ('69a66be6-1041-4425-855f-1e27e3f27636', 'ctx.ROMANTIC')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 't Fornuis — Anvers, 1 étoile — Belge classique, terroir
-- → terroir & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'style.TERROIR'),
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'cuisine.FR_CLASSIC'),
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'val.LOCAL_SUPPLY'),
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'val.SEASONAL'),
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'price.L'),
  ('e970aae5-9347-4329-88ad-c97d22d71463', 'cat.AUBERGE')
ON CONFLICT DO NOTHING;

-- ============================================================
-- [bu:r] — Milano, Michelin Plate — Italien contemporain
-- → explorer & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'cuisine.IT'),
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'style.NEO_BISTRO'),
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'prod.CHEESE'),
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'sense.CREAMY'),
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'price.M'),
  ('ebb14c3e-858f-4d41-ae60-f9ec2c72cb51', 'ctx.FRIENDS')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13 Comuni — Velo Veronese, Bib Gourmand — Terroir montagne
-- → terroir & carnivore
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'style.TERROIR'),
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'val.LOCAL_SUPPLY'),
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'prod.GAME'),
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'prod.RED_MEAT'),
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'price.S'),
  ('c9b8332a-6000-4ddd-a4b0-1e7979a5a01f', 'cat.AUBERGE')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 100/200 Kitchen — Hambourg, 2 étoiles — Poisson / mer
-- → marin & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'prod.FISH'),
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'prod.SEAFOOD'),
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'sense.IODINE'),
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'style.GASTRO'),
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'price.XL'),
  ('9dd3c155-4b69-4700-8f3e-1d761b32b704', 'ctx.SPECIAL')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 102 House — Shanghai, 2 étoiles — Cuisine chinoise gastronomique
-- → explorer & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('73f3d79f-ccaf-4d8d-8de2-d1d2fc953781', 'cuisine.CN'),
  ('73f3d79f-ccaf-4d8d-8de2-d1d2fc953781', 'style.GASTRO'),
  ('73f3d79f-ccaf-4d8d-8de2-d1d2fc953781', 'sense.UMAMI'),
  ('73f3d79f-ccaf-4d8d-8de2-d1d2fc953781', 'price.XL'),
  ('73f3d79f-ccaf-4d8d-8de2-d1d2fc953781', 'ctx.GASTRO_TRIP')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11 Woodfire — Dubai, 1 étoile — Grillé au feu de bois
-- → carnivore & explorer
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('b21e852d-5581-4426-8993-984fd47d8251', 'sense.GRILLED'),
  ('b21e852d-5581-4426-8993-984fd47d8251', 'sense.SMOKY'),
  ('b21e852d-5581-4426-8993-984fd47d8251', 'prod.RED_MEAT'),
  ('b21e852d-5581-4426-8993-984fd47d8251', 'prod.FISH'),
  ('b21e852d-5581-4426-8993-984fd47d8251', 'price.L'),
  ('b21e852d-5581-4426-8993-984fd47d8251', 'ctx.SPECIAL')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 't Nonnetje — Harderwijk, 2 étoiles — Fruits de mer / mer du Nord
-- → marin & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'prod.SEAFOOD'),
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'prod.CRUSTACEAN'),
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'sense.IODINE'),
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'sense.MINERAL'),
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'style.GASTRO'),
  ('372e3d43-d3e2-4ac6-b719-8b6c1561826f', 'price.XL')
ON CONFLICT DO NOTHING;

-- ============================================================
-- [w]einklang — Nürnberg, Michelin Plate — Végétal / vins nature
-- → naturel
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'prod.VEGETAL'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'val.BIO'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'val.NATURAL_WINE'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'val.VEGE_OK'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'val.SEASONAL'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'price.M'),
  ('81459f35-c88d-4e59-8cc0-7540bae22539', 'cat.WINE_BAR')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14Horses — Vilnius, Bib Gourmand — Bistronomique européen
-- → terroir & gourmet
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'style.BISTRO'),
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'cuisine.FR_CONTEMP'),
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'val.SEASONAL'),
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'price.S'),
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'cat.BISTRO'),
  ('748283b6-a0d7-478c-9f3d-223947bc0d9f', 'ctx.FRIENDS')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 100.1.Pyeongnaeng — Busan, Bib Gourmand — Coréen traditionnel
-- → explorer
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'cuisine.KR'),
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'sense.UMAMI'),
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'sense.ACID'),
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'price.XS'),
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'cat.STREET'),
  ('03d49405-d63a-4572-92f8-234e10a4c7f2', 'ctx.LOCAL')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ¡Toma! — Liège, 1 étoile — Espagnol / tapas
-- → explorer & terroir
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'cuisine.ES'),
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'prod.CHARCUTERIE'),
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'sense.SMOKY'),
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'ctx.FRIENDS'),
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'price.M'),
  ('3c9fc4a0-f64a-40f2-ba1d-33c1636a2402', 'cat.BISTRO')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 't Lansink — Hengelo, 1 étoile — Gastronomique néerlandais
-- → gourmet & terroir
-- ============================================================
INSERT INTO restaurant_traits (restaurant_id, trait_code)
VALUES
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'style.GASTRO'),
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'cuisine.FR_CLASSIC'),
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'val.LOCAL_SUPPLY'),
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'price.XL'),
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'ctx.TASTING'),
  ('2c418394-8566-49c9-9cc0-c3c58f0c3942', 'cat.STARRED')
ON CONFLICT DO NOTHING;
