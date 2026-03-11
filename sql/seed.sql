-- ============================================
-- SEED DATA - TEAMS
-- ============================================

insert into teams (team_number, player1, player2, group_name) values
  (1, 'Shastry', 'Shravan', 'A'),
  (2, 'Sarvajith', 'Badri', 'B'),
  (3, 'Tejas', 'Pavan', 'A'),
  (4, 'Manyutej', 'Ashrith', 'B'),
  (5, 'Puneeth', 'Srinidhi', 'A'),
  (6, 'Darshan', 'Chiranth', 'B'),
  (7, 'Pradyumna', 'Karthik', 'A'),
  (8, 'Gururaj', 'X', 'B');

-- ============================================
-- SEED DATA - LEAGUE MATCHES (12 matches)
-- ============================================

-- Match 1: 8:00 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (1, 'league', 'A',
  (select id from teams where team_number = 1),
  (select id from teams where team_number = 3),
  'Court 2', '8:00 AM', 'Gururaj', 'Darshan', 'Chiranth');

-- Match 2: 8:00 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (2, 'league', 'B',
  (select id from teams where team_number = 2),
  (select id from teams where team_number = 4),
  'Court 3', '8:00 AM', 'Karthik', 'Srinidhi', 'Puneeth');

-- Match 3: 8:45 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (3, 'league', 'A',
  (select id from teams where team_number = 5),
  (select id from teams where team_number = 7),
  'Court 2', '8:45 AM', 'Manyutej', 'Badri', 'Ashrith');

-- Match 4: 8:45 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (4, 'league', 'B',
  (select id from teams where team_number = 6),
  (select id from teams where team_number = 8),
  'Court 3', '8:45 AM', 'Shravan', 'Tejas', 'Pavan');

-- Match 5: 9:30 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (5, 'league', 'A',
  (select id from teams where team_number = 1),
  (select id from teams where team_number = 5),
  'Court 2', '9:30 AM', 'Ashrith', 'Manyutej', 'Gururaj');

-- Match 6: 9:30 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (6, 'league', 'B',
  (select id from teams where team_number = 2),
  (select id from teams where team_number = 6),
  'Court 3', '9:30 AM', 'Pavan', 'Karthik', 'Tejas');

-- Match 7: 10:15 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (7, 'league', 'A',
  (select id from teams where team_number = 3),
  (select id from teams where team_number = 7),
  'Court 2', '10:15 AM', 'Badri', 'Chiranth', 'Sarvajith');

-- Match 8: 10:15 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (8, 'league', 'B',
  (select id from teams where team_number = 4),
  (select id from teams where team_number = 8),
  'Court 3', '10:15 AM', 'Srinidhi', 'Puneeth', 'Shastry');

-- Match 9: 11:00 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (9, 'league', 'A',
  (select id from teams where team_number = 1),
  (select id from teams where team_number = 7),
  'Court 2', '11:00 AM', 'Manyutej', 'Ashrith', 'Darshan');

-- Match 10: 11:00 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (10, 'league', 'B',
  (select id from teams where team_number = 2),
  (select id from teams where team_number = 8),
  'Court 3', '11:00 AM', 'Pavan', 'Puneeth', 'Srinidhi');

-- Match 11: 11:45 AM - Court 2 - Group A
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (11, 'league', 'A',
  (select id from teams where team_number = 3),
  (select id from teams where team_number = 5),
  'Court 2', '11:45 AM', 'Gururaj', 'Badri', 'Sarvajith');

-- Match 12: 11:45 AM - Court 3 - Group B
insert into matches (match_number, round, group_name, team1_id, team2_id, court, scheduled_time, umpire, line_umpire1, line_umpire2)
values (12, 'league', 'B',
  (select id from teams where team_number = 4),
  (select id from teams where team_number = 6),
  'Court 3', '11:45 AM', 'Karthik', 'Shravan', 'Shastry');

-- ============================================
-- SEED DATA - KNOCKOUT MATCHES (placeholders)
-- ============================================

-- Semi Final 1: A1 vs B2
insert into matches (match_number, round, group_name, court, scheduled_time)
values (13, 'semi_final', null, 'Court 3', '1:30 PM');

-- Semi Final 2: B1 vs A2
insert into matches (match_number, round, group_name, court, scheduled_time)
values (14, 'semi_final', null, 'Court 3', '2:15 PM');

-- Final
insert into matches (match_number, round, group_name, court, scheduled_time)
values (15, 'final', null, 'Court 3', '3:30 PM');

-- ============================================
-- CREATE SET SCORES FOR ALL LEAGUE MATCHES
-- ============================================

-- Create empty set_scores for matches 1-12
do $$
declare
  m_id int;
begin
  for m_id in (select id from matches where match_number between 1 and 12) loop
    insert into set_scores (match_id, set_number, team1_score, team2_score) values
      (m_id, 1, 0, 0),
      (m_id, 2, 0, 0),
      (m_id, 3, 0, 0);
  end loop;
end $$;
