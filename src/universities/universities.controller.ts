import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto } from './dto/university.dto';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all universities (public)' })
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail with campuses & courses' })
  findOne(@Param('id') id: string) {
    return this.universitiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create university (admin)' })
  create(@Body() createUniversityDto: CreateUniversityDto) {
    return this.universitiesService.create(createUniversityDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update risk_level, cap (admin)' })
  update(
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(id, updateUniversityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete university (admin)' })
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(id);
  }

  // Campuses
  @Get(':id/campuses')
  @ApiOperation({ summary: 'List campuses' })
  getCampuses(@Param('id') id: string) {
    return this.universitiesService.getCampuses(id);
  }

  @Post('campuses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create campus (admin)' })
  createCampus(@Body() createCampusDto: CreateCampusDto) {
    return this.universitiesService.CreateCampus(createCampusDto);
  }

  @Patch('campuses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update is_regional (admin)' })
  updateCampus(
    @Param('id') id: string,
    @Body() updateCampusDto: UpdateCampusDto,
  ) {
    return this.universitiesService.updateCampus(id, updateCampusDto);
  }

  @Delete('campuses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete campus (admin)' })
  removeCampus(@Param('id') id: string) {
    return this.universitiesService.removeCampus(id);
  }

  // Courses
  @Get('courses')
  @ApiOperation({ summary: 'List with filters (public)' })
  findAllCourses(@Query() filters: any) {
    return this.universitiesService.findAllCourses(filters);
  }

  @Get('courses/search')
  @ApiOperation({ summary: 'Search with university & risk join' })
  searchCourses(@Query('q') q: string, @Query('anzsco') anzsco: string) {
    return this.universitiesService.searchCourses(q, anzsco);
  }

  @Post('courses')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create course (admin)' })
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.universitiesService.createCourse(createCourseDto);
  }

  @Patch('courses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update course (admin)' })
  updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.universitiesService.updateCourse(id, updateCourseDto);
  }

  @Delete('courses/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete course (admin)' })
  removeCourse(@Param('id') id: string) {
    return this.universitiesService.removeCourse(id);
  }
}
