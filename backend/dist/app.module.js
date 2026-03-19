"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const leads_module_1 = require("./leads/leads.module");
const pipelines_module_1 = require("./pipelines/pipelines.module");
const academic_module_1 = require("./academic/academic.module");
const students_module_1 = require("./students/students.module");
const billing_module_1 = require("./billing/billing.module");
const stats_module_1 = require("./stats/stats.module");
const integrations_module_1 = require("./integrations/integrations.module");
const exams_module_1 = require("./exams/exams.module");
const settings_module_1 = require("./settings/settings.module");
const common_module_1 = require("./common/common.module");
const calendar_module_1 = require("./calendar/calendar.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            leads_module_1.LeadsModule,
            pipelines_module_1.PipelinesModule,
            academic_module_1.AcademicModule,
            students_module_1.StudentsModule,
            billing_module_1.BillingModule,
            stats_module_1.StatsModule,
            integrations_module_1.IntegrationsModule,
            exams_module_1.ExamsModule,
            settings_module_1.SettingsModule,
            calendar_module_1.CalendarModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map