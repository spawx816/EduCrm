import { Controller, Post, Body, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post('register')
    async register(@Body() userData: any) {
        return this.authService.register(userData);
    }

    @Post('login')
    async login(@Body() loginData: any) {
        return this.authService.login(loginData);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'docente', 'comercial') // Restrict view to logged in personnel
    @Get('users')
    async getUsers() {
        return this.authService.getUsers();
    }

    @Get('roles')
    async getRoles() {
        return this.authService.getRoles();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() updateData: any) {
        return this.authService.updateUser(id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() updateData: any) {
        return this.authService.updateUser(req.user.id, updateData, true);
    }
}

