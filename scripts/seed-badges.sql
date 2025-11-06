-- Clear existing badges to avoid duplicates
DELETE FROM user_badges;
DELETE FROM badges;

-- Platform Verification Badges (source: PLATFORM)
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('care_verified', 'Care.com Verified', 'Verified Care.com user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('doordash_verified', 'DoorDash Verified', 'Verified DoorDash user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('intelycare_verified', 'IntelyCare Verified', 'Verified IntelyCare user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('clipboard_verified', 'Clipboard Verified', 'Verified Clipboard user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('nursa_verified', 'Nursa Verified', 'Verified Nursa user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('uber_verified', 'Uber Verified', 'Verified Uber user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}'),
('swing_verified', 'Swing Education Verified', 'Verified Swing Education user', 'PLATFORM', '{"type": "verification_count", "threshold": 1}');

-- Journey Badges (source: JOURNEY)
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('journey_starter', 'Journey Starter', 'Started your first journey', 'JOURNEY', '{"type": "journey_count", "threshold": 1}'),
('milestone_master', 'Milestone Master', 'Completed 10 journeys', 'JOURNEY', '{"type": "completed_journey_count", "threshold": 10}');

-- Community Badges (source: COMMUNITY)
INSERT INTO badges (code, name, description, source, criteria_json) VALUES
('helper_level_10', 'Helper Level 10', 'Posted 10 helpful comments', 'COMMUNITY', '{"type": "comment_count", "threshold": 10}');
