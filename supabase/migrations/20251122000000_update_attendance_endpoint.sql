-- Update attendance endpoint to use correct URL (attendances plural)
-- Based on SeamlessHR API documentation: https://docs.seamlesshr.com

-- Update the attendance endpoint URL to the correct one
UPDATE public.api_endpoints
SET endpoint_url = 'https://api-sandbox.seamlesshr.app/v1/attendances',
    description = 'Get attendance records with query parameters (page, perPage, search, scheduleType, dateType, startDate, endDate)'
WHERE name = 'attendance';

-- If the endpoint doesn't exist, insert it
INSERT INTO public.api_endpoints (name, endpoint_url, method, description, category, requires_auth)
VALUES (
  'attendance',
  'https://api-sandbox.seamlesshr.app/v1/attendances',
  'GET',
  'Get attendance records with query parameters (page, perPage, search, scheduleType, dateType, startDate, endDate)',
  'attendance',
  true
)
ON CONFLICT (name) DO UPDATE SET
  endpoint_url = EXCLUDED.endpoint_url,
  description = EXCLUDED.description;

