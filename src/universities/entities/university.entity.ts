import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('universities')
export class University {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  logo_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Campus, (campus) => campus.university)
  campuses: Campus[];
}

@Entity('campuses')
export class Campus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'universityId' })
  universityId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => University, (university) => university.campuses)
  @JoinColumn({ name: 'universityId' })
  university: University;

  @OneToMany(() => Course, (course) => course.campus)
  courses: Course[];
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'campusId' })
  campusId: string;

  @Column('uuid', { name: 'universityId' })
  universityId: string;

  @Column()
  courseTitle: string;

  @Column({ nullable: true })
  anzscoCode: string;

  @Column({ nullable: true })
  anzscoTitle: string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  qualification: string;

  @Column({ type: 'integer', nullable: true })
  annualFees: number;

  @Column({ default: false })
  isRegionalPointsEligible: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Campus, (campus) => campus.courses)
  @JoinColumn({ name: 'campusId' })
  campus: Campus;

  @ManyToOne(() => University)
  @JoinColumn({ name: 'universityId' })
  university: University;
}
