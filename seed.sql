-- ============================================
-- Seed Data: Delhi NCR Water Bodies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

INSERT INTO water_bodies (name, latitude, longitude, type, locality, city, state) VALUES
-- Major Lakes & Ponds
('Hauz Khas Lake', 28.5494, 77.2001, 'lake', 'Hauz Khas', 'Delhi', 'Delhi'),
('Bhalswa Lake', 28.7358, 77.1637, 'lake', 'Bhalswa', 'Delhi', 'Delhi'),
('Sanjay Lake', 28.6145, 77.3048, 'lake', 'Trilokpuri', 'Delhi', 'Delhi'),
('Naini Lake', 28.6025, 77.3195, 'lake', 'Mayur Vihar', 'Delhi', 'Delhi'),
('Purana Qila Lake', 28.6092, 77.2437, 'lake', 'Pragati Maidan', 'Delhi', 'Delhi'),
('Deer Park Lake', 28.5501, 77.2087, 'lake', 'Hauz Khas', 'Delhi', 'Delhi'),
('Surajkund Lake', 28.4920, 77.2870, 'lake', 'Surajkund', 'Delhi', 'Delhi'),
('Badkhal Lake', 28.4350, 77.2980, 'lake', 'Faridabad', 'Delhi', 'Delhi'),
('Najafgarh Lake', 28.5720, 77.0020, 'lake', 'Najafgarh', 'Delhi', 'Delhi'),
('Timarpur Lake', 28.6987, 77.2130, 'lake', 'Timarpur', 'Delhi', 'Delhi'),
('Wazirabad Lake', 28.7210, 77.2280, 'lake', 'Wazirabad', 'Delhi', 'Delhi'),
('Sultanpur Lake', 28.4690, 76.8890, 'lake', 'Sultanpur', 'Delhi', 'Delhi'),

-- Yamuna River Points
('Yamuna - Wazirabad Barrage', 28.7200, 77.2300, 'river', 'Wazirabad', 'Delhi', 'Delhi'),
('Yamuna - ITO Bridge', 28.6280, 77.2490, 'river', 'ITO', 'Delhi', 'Delhi'),
('Yamuna - Nizamuddin Bridge', 28.5890, 77.2530, 'river', 'Nizamuddin', 'Delhi', 'Delhi'),
('Yamuna - Okhla Barrage', 28.5430, 77.2780, 'river', 'Okhla', 'Delhi', 'Delhi'),
('Yamuna - Signature Bridge', 28.7080, 77.2280, 'river', 'Wazirabad', 'Delhi', 'Delhi'),
('Yamuna - Geeta Colony Ghat', 28.6500, 77.2700, 'river', 'Geeta Colony', 'Delhi', 'Delhi'),
('Yamuna - Kudesia Ghat', 28.6630, 77.2480, 'river', 'Kashmere Gate', 'Delhi', 'Delhi'),

-- Drains & Canals
('Najafgarh Drain', 28.5800, 77.0100, 'drain', 'Najafgarh', 'Delhi', 'Delhi'),
('Supplementary Drain', 28.6320, 77.0850, 'drain', 'Dwarka', 'Delhi', 'Delhi'),
('Barapullah Nallah', 28.5820, 77.2400, 'drain', 'Sarai Kale Khan', 'Delhi', 'Delhi'),
('Shahdara Drain', 28.6810, 77.2900, 'drain', 'Shahdara', 'Delhi', 'Delhi'),
('Civil Lines Drain', 28.6800, 77.2200, 'drain', 'Civil Lines', 'Delhi', 'Delhi'),

-- Step Wells & Heritage
('Agrasen ki Baoli', 28.6263, 77.2243, 'stepwell', 'Connaught Place', 'Delhi', 'Delhi'),
('Rajon ki Baoli', 28.5270, 77.1860, 'stepwell', 'Mehrauli', 'Delhi', 'Delhi'),
('Gandhak ki Baoli', 28.5220, 77.1780, 'stepwell', 'Mehrauli', 'Delhi', 'Delhi'),

-- Ponds
('Mukundpur Pond', 28.7200, 77.1500, 'pond', 'Mukundpur', 'Delhi', 'Delhi'),
('Kirari Pond', 28.7100, 77.0600, 'pond', 'Kirari', 'Delhi', 'Delhi'),
('Tikri Kalan Pond', 28.7400, 77.0200, 'pond', 'Tikri Kalan', 'Delhi', 'Delhi'),
('Bawana Pond', 28.7760, 77.0340, 'pond', 'Bawana', 'Delhi', 'Delhi'),
('Narela Pond', 28.8520, 77.0930, 'pond', 'Narela', 'Delhi', 'Delhi'),
('Alipur Pond', 28.7960, 77.1350, 'pond', 'Alipur', 'Delhi', 'Delhi'),
('Bakkarwala Pond', 28.6800, 77.0300, 'pond', 'Bakkarwala', 'Delhi', 'Delhi'),
('Mundka Pond', 28.6830, 77.0190, 'pond', 'Mundka', 'Delhi', 'Delhi'),
('Nilothi Pond', 28.6700, 77.0430, 'pond', 'Nilothi', 'Delhi', 'Delhi'),
('Khyala Pond', 28.6560, 77.0750, 'pond', 'Khyala', 'Delhi', 'Delhi'),
('Hastsal Pond', 28.6330, 77.0570, 'pond', 'Hastsal', 'Delhi', 'Delhi'),
('Kakrola Pond', 28.6100, 77.0400, 'pond', 'Kakrola', 'Delhi', 'Delhi'),
('Dichaon Kalan Pond', 28.5600, 77.0050, 'pond', 'Dichaon Kalan', 'Delhi', 'Delhi'),
('Kapashera Pond', 28.5100, 77.0800, 'pond', 'Kapashera', 'Delhi', 'Delhi'),
('Chhawla Pond', 28.5630, 76.9500, 'pond', 'Chhawla', 'Delhi', 'Delhi'),
('Jaffarpur Pond', 28.5310, 77.0010, 'pond', 'Jaffarpur', 'Delhi', 'Delhi'),
('Rawta Pond', 28.5150, 76.9700, 'pond', 'Rawta', 'Delhi', 'Delhi'),
('Ghitorni Pond', 28.4950, 77.1450, 'pond', 'Ghitorni', 'Delhi', 'Delhi'),
('Satbari Pond', 28.4800, 77.1700, 'pond', 'Satbari', 'Delhi', 'Delhi'),
('Asola Pond', 28.4600, 77.2150, 'pond', 'Asola', 'Delhi', 'Delhi'),
('Tughlaqabad Pond', 28.5070, 77.2530, 'pond', 'Tughlaqabad', 'Delhi', 'Delhi'),
('Madanpur Khadar Pond', 28.5200, 77.2950, 'pond', 'Madanpur Khadar', 'Delhi', 'Delhi'),

-- Noida / NCR
('Okhla Bird Sanctuary Wetland', 28.5500, 77.3100, 'wetland', 'Noida', 'Delhi', 'Delhi'),

-- Canals
('Munak Canal', 28.8200, 77.0500, 'canal', 'North Delhi', 'Delhi', 'Delhi'),
('Indira Gandhi Canal', 28.7500, 77.0700, 'canal', 'Rohini', 'Delhi', 'Delhi');
