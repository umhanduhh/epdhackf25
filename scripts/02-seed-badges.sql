-- Delete existing badges to avoid conflicts
DELETE FROM badges;

-- Platform Verification Badges
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('care_verified', 'Care.com Verified', 'Verified Care.com user', 'PLATFORM', '{"type": "platform_verification", "platform": "care"}'),
('doordash_verified', 'DoorDash Verified', 'Verified DoorDash user', 'PLATFORM', '{"type": "platform_verification", "platform": "doordash"}'),
('intelycare_verified', 'IntelyCare Verified', 'Verified IntelyCare user', 'PLATFORM', '{"type": "platform_verification", "platform": "intelycare"}'),
('clipboard_verified', 'Clipboard Health Verified', 'Verified Clipboard Health user', 'PLATFORM', '{"type": "platform_verification", "platform": "clipboard"}'),
('nursa_verified', 'Nursa Verified', 'Verified Nursa user', 'PLATFORM', '{"type": "platform_verification", "platform": "nursa"}'),
('uber_verified', 'Uber Verified', 'Verified Uber user', 'PLATFORM', '{"type": "platform_verification", "platform": "uber"}'),
('swing_verified', 'Swing Education Verified', 'Verified Swing Education user', 'PLATFORM', '{"type": "platform_verification", "platform": "swing"}');

-- Journey Badges
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('journey_starter', 'Journey Starter', 'Started your first journey', 'JOURNEY', '{"type": "journey_count", "threshold": 1}'),
('milestone_master', 'Milestone Master', 'Completed 10 journeys', 'JOURNEY', '{"type": "completed_journey_count", "threshold": 10}');

-- Community Badges
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('helper_level_10', 'Helper Level 10', 'Posted 10 helpful comments', 'COMMUNITY', '{"type": "comment_count", "threshold": 10}');
