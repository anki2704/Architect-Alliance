import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
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

// Strip the old mock `id` field — MongoDB will assign its own `_id`.
function stripId<T extends { id?: string }>(item: T) {
  const { id, ...rest } = item;
  return rest;
}

async function seed() {
  await connectDB();
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
  await Testimonial.insertMany(TESTIMONIALS);
  await JournalPost.insertMany(JOURNAL_POSTS);

  const anyFallback = Object.values(SEED_CREDENTIALS).some((c) => c.usedFallback);
  if (anyFallback) {
    console.warn(
      '\n[Seed] WARNING: one or more accounts are using the default local-dev password.\n' +
      '  Set SEED_ADMIN_PASSWORD / SEED_DESIGNER_PASSWORD / SEED_CUSTOMER_PASSWORD in .env\n' +
      '  to real, unique passwords before seeding a production database.\n'
    );
  }

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
  console.log(`  Admin:     ${admin.email} / ${SEED_CREDENTIALS.admin.usedFallback ? '(default dev password)' : '(from .env)'}`);
  console.log(`  Designer:  ${designer.email} / ${SEED_CREDENTIALS.designer.usedFallback ? '(default dev password)' : '(from .env)'}`);
  console.log(`  Customer:  ${customer.email} / ${SEED_CREDENTIALS.customer.usedFallback ? '(default dev password)' : '(from .env)'}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
