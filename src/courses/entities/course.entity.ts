import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'university_name' })
  universityName: string;

  @Column({ name: 'course_title' })
  courseTitle: string;

  @Column({ name: 'anzsco_code', nullable: true })
  anzscoCode: string;

  @Column({ name: 'anzsco_title', nullable: true })
  anzscoTitle: string;

  /**
   * Postcode of the teaching campus. This is the ONLY input that determines
   * regional status; there is no manual isRegional override.
   */
  @Column({ name: 'campus_postcode', type: 'varchar', length: 4, nullable: true })
  campusPostcode: string | null;

  /**
   * Derived — never set by an admin. Set from campusPostcode by the
   * PostcodeValidatorService on create/update.
   */
  @Column({ name: 'is_regional', default: false })
  isRegional: boolean;

  /**
   * Derived regional tier for reporting/priority: METRO / CATEGORY_2 /
   * CATEGORY_3 / UNKNOWN. Also set from campusPostcode.
   */
  @Column({ name: 'regional_category', type: 'varchar', nullable: true })
  regionalCategory: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
