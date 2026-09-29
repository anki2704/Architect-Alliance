import 'dotenv/config';
import { connectDB } from '../config/db';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { EnquiryMessage } from '../models/EnquiryMessage';
import { TeamMember } from '../models/TeamMember';
import { Testimonial } from '../models/Testimonial';
import { JournalPost } from '../models/JournalPost';
import { INITIAL_PROJECTS, TEAM_MEMBERS, TESTIMONIALS } from '../../src/data/mockData';
import { JOURNAL_POSTS, DEMO_USERS, SEED_CREDENTIALS } from './seedData';
import mongoose from 'mongoose';
import { createInterface } from 'node:readline/promises';
import { evaluateSeedGuard } from '../utils/seedGuard';

// Strip the old mock `id` field — MongoDB will assign its own `_id`.
function stripId<T extends { id?: string }>(item: T) {
  const { id, ...rest } = item;
  return rest;
}

async function seed() {
  await connectDB();

  // Safety net: this script WIPES every collection below before reinserting demo content.
  // See server/utils/seedGuard.ts for the exact rules.
  const [projectCount, userCount] = await Promise.all([
    Project.countDocuments(),
    User.countDocuments()
  ]);
  const hasExistingData = projectCount > 0 || userCount > 0;
  const forced = process.argv.includes('--force') || process.env.CONFIRM_RESEED === 'yes';
  const dbName = mongoose.connection.name;

  let typedName = process.env.SEED_CONFIRM_DB;
  if (hasExistingData && forced && !typedName && process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    typedName = await rl.question(
      `\nThis will DELETE everything in database "${dbName}" (${projectCount} project(s), ${userCount} user(s)).\nType the database name to confirm: `
    );
    rl.close();
  }

  const guard = evaluateSeedGuard({
    nodeEnv: process.env.NODE_ENV,
    allowProduction: process.env.ALLOW_PRODUCTION_SEED === 'yes',
    hasExistingData,
    forced,
    dbName,
    typedName
  });
  if (!guard.ok) {
    console.error(`\n[Seed] Refusing to run: ${guard.reason}\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('[Seed] Connected. Clearing existing collections...');

  await Promise.all([
    Project.deleteMany({}),
    User.deleteMany({}),
    Booking.deleteMany({}),
    EnquiryMessage.deleteMany({}),
    TeamMember.deleteMany({}),
    Testimonial.deleteMany({}),
    JournalPost.deleteMany({})
  ]);

  console.log('[Seed] Inserting projects, team, testimonials, journal posts...');
  await Project.insertMany(INITIAL_PROJECTS.map(stripId));
  await TeamMember.insertMany(TEAM_MEMBERS.map((m, i) => ({ ...m, order: i })));
  await Testimonial.insertMany(TESTIMONIALS.map((t) => ({ ...t, approved: true })));
  await JournalPost.insertMany(JOURNAL_POSTS);


  console.log('[Seed] Creating users (admin / designer / customer)...');
  // Use create() (not insertMany) so the password-hashing pre-save hook runs.
  const [admin, designer, customer] = await User.create(DEMO_USERS);

  console.log('[Seed] Creating a sample booking and Enquiry message...');
  await Booking.create({
    customerId: customer._id,
    customerName: customer.name,
    email: customer.email,
    phone: '+1 (555) 234-5678',
    projectType: 'Interior Design',
    date: '2026-08-05',
    time: '11:00 AM',
    notes:
      'Would love to explore a warm, minimal palette with natural wood tones and ambient warm lighting for a contemporary villa.',
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentAmount: 999,
    assignedDesignerId: designer._id
  });

  /*await EnquiryMessage.create({
    name: 'Eleanor Vance',
    email: 'eleanor@vancedesign.com',
    subject: 'Feasibility Study for Commercial Plaza',
    message:
      'We are looking to develop a 15-story mixed-use commercial space downtown and would like to schedule an initial design review.'
  });*/

  console.log('\n[Seed] Done! Login credentials:');
  console.log(`  Admin:     ${admin.email} / (from environment)`);
  console.log(`  Designer:  ${designer.email} / (from environment)`);
  console.log(`  Customer:  ${customer.email} / (from environment)`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
