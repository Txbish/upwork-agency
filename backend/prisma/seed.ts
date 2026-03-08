import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const roles = await seedRoles();
  const teams = await seedTeams();
  const niches = await seedNiches();
  const users = await seedUsers(roles, teams);
  await seedCloserNiches(users, niches);

  console.log('Seed completed:', {
    roles: Object.keys(roles),
    teams: Object.keys(teams),
    niches: Object.keys(niches),
    users: Object.keys(users),
  });
}

async function seedRoles() {
  const roleNames = ['admin', 'bidder', 'closer', 'developer', 'qa', 'script_writer', 'leadership'];
  const roles: Record<string, { id: string; name: string }> = {};

  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  return roles;
}

async function seedTeams() {
  const teamDefs = [
    { id: 'team-sales', name: 'Sales' },
    { id: 'team-dev', name: 'Development' },
    { id: 'team-qa', name: 'QA' },
    { id: 'team-leadership', name: 'Leadership' },
  ];

  const teams: Record<string, { id: string; name: string }> = {};

  for (const t of teamDefs) {
    teams[t.name.toLowerCase()] = await prisma.team.upsert({
      where: { id: t.id },
      update: { name: t.name },
      create: t,
    });
  }

  return teams;
}

async function seedNiches() {
  const nicheDefs = [
    {
      name: 'AI Automation',
      slug: 'ai-automation',
      description: 'AI agents, chatbots, workflow automation',
    },
    {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Full-stack web applications and websites',
    },
    {
      name: 'App Development',
      slug: 'app-development',
      description: 'Mobile and desktop applications',
    },
    {
      name: 'Data & Analytics',
      slug: 'data-analytics',
      description: 'Data pipelines, dashboards, BI tools',
    },
    {
      name: 'DevOps & Cloud',
      slug: 'devops-cloud',
      description: 'Infrastructure, CI/CD, cloud architecture',
    },
  ];

  const niches: Record<string, { id: string; name: string }> = {};

  for (const n of nicheDefs) {
    niches[n.slug] = await prisma.niche.upsert({
      where: { slug: n.slug },
      update: { name: n.name, description: n.description },
      create: n,
    });
  }

  return niches;
}

async function seedUsers(
  roles: Record<string, { id: string }>,
  teams: Record<string, { id: string }>,
) {
  const password = await bcrypt.hash('password123', 10);

  const userDefs = [
    {
      email: 'admin@aop.local',
      firstName: 'Admin',
      lastName: 'User',
      roleId: roles.admin.id,
      teamId: teams.leadership.id,
    },
    {
      email: 'bidder@aop.local',
      firstName: 'Sarah',
      lastName: 'Chen',
      roleId: roles.bidder.id,
      teamId: teams.sales.id,
    },
    {
      email: 'closer@aop.local',
      firstName: 'James',
      lastName: 'Wilson',
      roleId: roles.closer.id,
      teamId: teams.sales.id,
    },
    {
      email: 'closer2@aop.local',
      firstName: 'Maria',
      lastName: 'Garcia',
      roleId: roles.closer.id,
      teamId: teams.sales.id,
    },
    {
      email: 'developer@aop.local',
      firstName: 'Alex',
      lastName: 'Kim',
      roleId: roles.developer.id,
      teamId: teams.development.id,
    },
    {
      email: 'qa@aop.local',
      firstName: 'Pat',
      lastName: 'Taylor',
      roleId: roles.qa.id,
      teamId: teams.qa.id,
    },
    {
      email: 'scriptwriter@aop.local',
      firstName: 'Jordan',
      lastName: 'Lee',
      roleId: roles.script_writer.id,
      teamId: teams.sales.id,
    },
    {
      email: 'lead@aop.local',
      firstName: 'Morgan',
      lastName: 'Davis',
      roleId: roles.leadership.id,
      teamId: teams.leadership.id,
    },
  ];

  const users: Record<string, { id: string; email: string }> = {};

  for (const u of userDefs) {
    const key = u.email.split('@')[0];
    users[key] = await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, roleId: u.roleId, teamId: u.teamId },
      create: { ...u, passwordHash: password },
    });
  }

  return users;
}

async function seedCloserNiches(
  users: Record<string, { id: string }>,
  niches: Record<string, { id: string }>,
) {
  const assignments = [
    { userId: users.closer.id, nicheId: niches['ai-automation'].id },
    { userId: users.closer.id, nicheId: niches['web-development'].id },
    { userId: users.closer2.id, nicheId: niches['app-development'].id },
    { userId: users.closer2.id, nicheId: niches['data-analytics'].id },
  ];

  for (const a of assignments) {
    await prisma.closerNiche.upsert({
      where: { userId_nicheId: { userId: a.userId, nicheId: a.nicheId } },
      update: {},
      create: a,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
