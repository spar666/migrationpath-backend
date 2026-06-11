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

  @Column({ name: 'annual_fees', type: 'integer', default: 40000 })
  annualFees: number;

  @Column({ default: '2 years' })
  duration: string;

  @Column({ name: 'is_regional', default: false })
  isRegional: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
