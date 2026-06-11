import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedOccupations1786000000000 implements MigrationInterface {
  name = 'SeedOccupations1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "occupations_list" (occupation_name, anzsco_code, description, assessing_authority, points_value) VALUES
        ('Software Engineer', '261313', 'Designs, develops, and maintains software systems and applications', 'ACS', 20),
        ('Accountant (General)', '221111', 'Provides accounting services including financial reporting and taxation', 'CPA/CA/IPA', 20),
        ('Civil Engineer', '233211', 'Plans, designs and oversees construction of civil engineering projects', 'Engineers Australia', 20),
        ('Mechanical Engineer', '233512', 'Designs and oversees manufacture of mechanical systems', 'Engineers Australia', 20),
        ('Electrical Engineer', '233311', 'Designs and oversees electrical systems and equipment', 'Engineers Australia', 20),
        ('Registered Nurse', '254412', 'Provides nursing care to patients in various healthcare settings', 'ANMAC', 20),
        ('General Practitioner', '253111', 'Diagnoses and treats medical conditions in general practice', 'AMC', 20),
        ('Chef', '351311', 'Plans and prepares menus and culinary dishes', 'TRA', 20),
        ('Cook', '351411', 'Prepares and cooks food in hospitality establishments', 'TRA', 20),
        ('ICT Business Analyst', '261111', 'Analyses business processes and identifies ICT solutions', 'ACS', 20),
        ('Systems Analyst', '261112', 'Analyses and designs IT systems to meet business needs', 'ACS', 20),
        ('Analyst Programmer', '261311', 'Analyses and develops program code to meet system requirements', 'ACS', 20),
        ('Developer Programmer', '261312', 'Writes and tests code for software applications', 'ACS', 20),
        ('ICT Security Specialist', '262112', 'Implements security measures for ICT systems', 'ACS', 20),
        ('Network Administrator', '263112', 'Manages and maintains computer networks', 'ACS', 20),
        ('Architect', '232111', 'Designs buildings and oversees construction projects', 'AACA', 20),
        ('Quantity Surveyor', '233213', 'Manages construction costs and contracts', 'AIQS', 20),
        ('Land Surveyor', '232212', 'Measures and maps land boundaries and features', 'SSI', 20),
        ('Cartographer', '232213', 'Creates and updates maps and spatial data', 'SSI', 20),
        ('Surveying Technician', '312116', 'Assists surveyors with field measurements and data collection', 'SSI', 20),
        ('Social Worker', '272511', 'Provides support and advocacy for individuals and communities', 'AASW', 20),
        ('Early Childhood Teacher', '241111', 'Educates children in early childhood settings', 'AITSL', 20),
        ('Secondary School Teacher', '241411', 'Teaches secondary school students in specialised subjects', 'AITSL', 20),
        ('Special Needs Teacher', '241511', 'Educates students with special learning needs', 'AITSL', 20),
        ('University Lecturer', '242111', 'Lectures and conducts research at universities', 'AITSL', 20),
        ('Electrical Engineer Technician', '312311', 'Assists electrical engineers in design and testing', 'Engineers Australia', 20),
        ('Electronics Engineer', '233411', 'Designs and develops electronic systems and components', 'Engineers Australia', 20),
        ('Industrial Engineer', '233511', 'Optimises industrial processes and production systems', 'Engineers Australia', 20),
        ('Production Engineer', '233513', 'Manages manufacturing processes and production operations', 'Engineers Australia', 20),
        ('Mining Engineer', '233611', 'Plans and manages mining operations', 'Engineers Australia', 20),
        ('Petroleum Engineer', '233612', 'Designs extraction methods for oil and gas', 'Engineers Australia', 20),
        ('Chemical Engineer', '233111', 'Designs chemical processes and industrial equipment', 'Engineers Australia', 20),
        ('Materials Engineer', '233112', 'Develops materials for manufacturing and construction', 'Engineers Australia', 20),
        ('Biomedical Engineer', '233913', 'Designs medical equipment and healthcare technologies', 'Engineers Australia', 20),
        ('Environmental Engineer', '233915', 'Develops solutions for environmental issues', 'Engineers Australia', 20),
        ('Geotechnical Engineer', '233212', 'Analyses soil and rock mechanics for construction', 'Engineers Australia', 20),
        ('Structural Engineer', '233214', 'Designs structures to withstand loads and forces', 'Engineers Australia', 20),
        ('Transport Engineer', '233215', 'Plans transport systems and infrastructure', 'Engineers Australia', 20),
        ('Medical Laboratory Scientist', '234611', 'Performs medical tests and analyses specimens', 'AIMS', 20),
        ('Medical Diagnostic Radiographer', '251211', 'Performs diagnostic imaging procedures', 'ASMIRT', 20),
        ('Occupational Therapist', '252411', 'Helps patients develop or recover daily living skills', 'OTC', 20),
        ('Physiotherapist', '252511', 'Treats physical injuries and movement disorders', 'APC', 20),
        ('Psychologist', '272311', 'Assesses and treats mental health conditions', 'APS', 20),
        ('Dentist', '252312', 'Diagnoses and treats dental conditions', 'ADC', 20),
        ('Pharmacist', '251511', 'Dispenses medications and provides healthcare advice', 'APC', 20),
        ('Veterinarian', '234711', 'Diagnoses and treats animal health conditions', 'AVBC', 20),
        ('Medical Laboratory Technician', '311213', 'Assists with medical laboratory testing and analysis', 'AIMS', 20),
        ('Dental Technician', '411213', 'Constructs and repairs dental appliances', 'TRA', 20),
        ('Dental Hygienist', '411211', 'Provides preventative dental care and hygiene treatment', 'ADC', 20),
        ('Optometrist', '251411', 'Examines eyes and prescribes corrective lenses', 'OCANZ', 20),
        ('Sonographer', '251214', 'Performs ultrasound examinations for diagnosis', 'ASAR', 20),
        ('Cardiac Technician', '311212', 'Operates equipment for cardiac diagnosis and treatment', 'AIMS', 20),
        ('Midwife', '254111', 'Provides care to women during pregnancy and childbirth', 'ANMAC', 20),
        ('Aged Care Manager', '134202', 'Manages aged care facilities and services', 'ACS', 20),
        ('Construction Manager', '133111', 'Oversees construction projects and sites', 'VETASSESS', 20),
        ('Project Builder', '133112', 'Manages building projects from inception to completion', 'VETASSESS', 20),
        ('Engineering Manager', '133211', 'Leads engineering teams and projects', 'Engineers Australia', 20),
        ('Child Care Centre Manager', '134111', 'Manages childcare centres and early learning programs', 'ACS', 20),
        ('Health and Welfare Services Manager', '134299', 'Manages health and welfare service programs', 'VETASSESS', 20),
        ('ICT Project Manager', '135112', 'Manages ICT projects from planning to delivery', 'ACS', 20),
        ('ICT Managers', '135199', 'Oversees ICT operations and strategy', 'ACS', 20),
        ('Multimedia Specialist', '261211', 'Creates multimedia content and interactive applications', 'ACS', 20),
        ('Web Developer', '261212', 'Designs and builds websites and web applications', 'ACS', 20),
        ('Database Administrator', '262111', 'Manages and maintains database systems', 'ACS', 20),
        ('Systems Administrator', '262113', 'Manages ICT infrastructure and server systems', 'ACS', 20),
        ('Computer Network and Systems Engineer', '263111', 'Designs and manages computer networks', 'ACS', 20),
        ('Telecommunications Engineer', '263311', 'Designs and manages telecommunications systems', 'ACS', 20),
        ('Telecommunications Network Engineer', '263312', 'Designs and optimises telecommunications networks', 'ACS', 20),
        ('Barrister', '271111', 'Provides legal representation in court proceedings', 'SLAA', 20),
        ('Solicitor', '271311', 'Provides legal advice and prepares legal documents', 'SLAA', 20),
        ('Urban and Regional Planner', '232611', 'Develops land use plans and policies', 'PIA', 20),
        ('Valuer', '224512', 'Assesses property values for various purposes', 'VETASSESS', 20),
        ('Actuary', '224111', 'Analyses financial risks using mathematical models', 'VETASSESS', 20),
        ('Economist', '224311', 'Analyses economic data and trends', 'VETASSESS', 20),
        ('Land Economist', '224411', 'Advises on land use and property economics', 'VETASSESS', 20),
        ('Management Consultant', '224712', 'Advises organisations on management and strategy', 'VETASSESS', 20),
        ('Architectural Draftsperson', '312111', 'Prepares architectural drawings and plans', 'VETASSESS', 20),
        ('Building Inspector', '312113', 'Inspects buildings for compliance with regulations', 'VETASSESS', 20),
        ('Civil Engineering Draftsperson', '312211', 'Prepares detailed drawings for civil engineering works', 'Engineers Australia', 20),
        ('Civil Engineering Technician', '312212', 'Assists civil engineers in planning and design', 'Engineers Australia', 20),
        ('Surveyor', '232214', 'Conducts land surveys and measurements', 'SSI', 20)
      ON CONFLICT (anzsco_code) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO "occupation_thresholds" (occupation_id, state_code, min_points, is_available)
      SELECT o.id, s.state_code, 65, true
      FROM "occupations_list" o
      CROSS JOIN (VALUES ('NSW'), ('VIC'), ('QLD'), ('SA'), ('WA'), ('TAS'), ('NT'), ('ACT')) AS s(state_code)
      WHERE NOT EXISTS (
        SELECT 1 FROM "occupation_thresholds" t
        WHERE t.occupation_id = o.id AND t.state_code = s.state_code
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "occupation_thresholds"`);
    await queryRunner.query(`DELETE FROM "occupations_list"`);
  }
}
