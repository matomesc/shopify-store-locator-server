UPDATE "Plan"
SET "analyticsRetention" = 180
WHERE id = 'enterprise';

UPDATE "Plan"
SET "analyticsRetention" = 365
WHERE id = 'unlimited';
