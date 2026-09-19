import { SampleDocument } from '../types';

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'medicare-part-b',
    title: 'Medicare Part B Notice & Bill ($482.50)',
    shortLabel: 'Medicare Part B Notice & Bill ($482.50)',
    type: 'Medicare Summary Notice / Clinical Bill',
    billedAmount: '$482.50',
    date: 'November 14, 2024',
    formId: 'Form CMS-10156',
    originalText: `DEPARTMENT OF HEALTH & HUMAN SERVICES
CENTERS FOR MEDICARE & MEDICAID SERVICES
Part B Medicare Summary Notice - Form CMS-10156
OMB 0938-1197

Beneficiary Name: MARGARET E. MILLER
Medicare Number: 1EG4-TE9-MK22
Notice Date: November 10, 2024
Attending Provider: DR. ROBERT CHEN, MD

NOTICE OF NON-COVERAGE & BENEFICIARY FINANCIAL LIABILITY

Claim Control Reference: #8839201-B | Processed under Jurisdiction K

Prior authorization criteria under Section 1862(a)(1)(A) of the Social Security Act were not satisfied for Service Code 99214 (Outpatient Clinician Visit, Level 4) administered on 10/12/2024.

Reason code citation: Remittance Advice Remark Code PR-204. The requested medical documentation demonstrating reasonable and customary medical necessity was absent at adjudication.

Provider Billed Amount: $540.00
Medicare Approved Amount: $0.00
Balance Due From Beneficiary: $482.50`,
    explanation: {
      documentType: 'Medicare Summary Notice (Form CMS-10156)',
      plainSummary: "You received a bill for $482.50 because your doctor's office forgot to send a routine pre-approval form. You do not have to pay this immediately out of your own pocket. DigiSathi note: Medicare frequently reverses this charge once the clinic resubmits the paperwork.",
      atAGlance: {
        whatItIs: "Medicare did not pay for Dr. Robert Chen's clinic visit on Oct 12th because a routine administrative approval form was left out of the packet.",
        whatYouOwe: "The clinic printed a bill for $482.50, but this is almost always resolved when the clinic attaches their clinical notes and resubmits code 99214.",
        riskAndTiming: "Low risk, provided you or Sarah make a 5-minute phone call to Dr. Chen's office before December 14, 2024."
      },
      urgency: 'soon',
      urgencyNote: "Needs Attention by December 14 • 21 days remaining",
      deadline: 'December 14, 2024',
      glossaryTerms: [
        {
          term: 'Social Security Act Sec 1862',
          definition: "A standard legal clause Medicare quotes whenever clinic paperwork or records are missing. While it sounds scary and stern, it almost always just means the clinic forgot to attach Dr. Chen's chart notes."
        },
        {
          term: 'Remittance PR-204',
          definition: "Patient Responsibility Remark Code 204. This code gets stamped automatically when an insurance processor is waiting on missing documentation from the doctor's billing team."
        },
        {
          term: 'Beneficiary Liability',
          definition: "Formal legal terminology for 'the preliminary bill amount' before clerical errors, appeals, or missing records are resolved."
        },
        {
          term: 'Redetermination Form CMS-20027',
          definition: "A free, standard 1-page form you or your caregiver can mail to Medicare if the clinic billing office fails to resubmit their records within 30 days."
        }
      ],
      nextSteps: [
        {
          title: 'Step 1: Verify this was your appointment',
          detail: 'Confirmed: Dr. Robert Chen (Cardiology Clinic), appointment date October 12, 2024.',
          mostUrgent: false,
          completed: true
        },
        {
          title: "MOST IMPORTANT ACTION (Takes ~5 mins) — Call Dr. Chen's Billing Department",
          detail: "Call their office directly at (555) 019-2849. Ask for the billing coordinator and read the pre-written script below. (Doctor's Office Billing Hours: Mon–Fri, 9am–4pm)",
          mostUrgent: true,
          completed: false
        },
        {
          title: 'Step 3: Only if the clinic refuses to resubmit',
          detail: 'If the office does not fix the claim within 10 business days, click "Download Form CMS-20027" to file a 1-page free Medicare appeal before December 14.',
          mostUrgent: false,
          completed: false
        }
      ],
      callScript: "Hello, my name is Margaret Miller. I am calling about notice CMS-10156 for claim #8839201-B from my visit on October 12th.\n\nMedicare informed me that code 99214 was denied because prior clinical documentation wasn't included. Could your billing coordinator please attach the doctor's chart notes and resubmit this claim under remark code PR-204 so that I am not erroneously billed $482.50?"
    }
  },
  {
    id: 'discharge-instructions',
    title: 'Discharge Instructions (Cardiology)',
    shortLabel: 'Discharge Instructions (Cardiology)',
    type: 'Hospital Discharge & Medication Protocol',
    billedAmount: '$0.00',
    date: 'November 02, 2024',
    formId: 'Form DS-881',
    originalText: `VALLEY CARDIOLOGY MEDICAL CENTER
POST-CORONARY STENT DISCHARGE PROTOCOL — FORM DS-881
Patient: MARGARET E. MILLER | DOB: 04/12/1948 | Attending: DR. V. SHARMA, MD

DISCHARGE MEDICATION REGIMEN:
1. Clopidogrel (Plavix) 75mg PO daily. CRITICAL: DUAL ANTIPLATELET THERAPY — DO NOT DISCONTINUE WITHOUT CARDIOLOGIST WRITTEN CONSENT.
2. Metoprolol Succinate ER 25mg PO QAM.
3. Atorvastatin 40mg PO QPM.

RESTRICTIONS & PRECAUTIONS:
- Right femoral access site: No heavy lifting (>10 lbs) for 10 days.
- Bruising of 1-2 inches around puncture site is anticipated. If hematoma expands rapidly or pulses, proceed to nearest emergency department immediately.
- Scheduled follow-up clinic appointment with Dr. Sharma in 14 days. Call 555-014-9920 to confirm slot.`,
    explanation: {
      documentType: 'Hospital Discharge Summary (Form DS-881)',
      plainSummary: "These are your post-procedure safety instructions after your heart stent. The most important rule is to take your blood-thinner (Plavix) every morning without skipping, and to avoid lifting anything heavier than a gallon of milk for 10 days.",
      atAGlance: {
        whatItIs: "Your official take-home instructions following your heart stent placement at Valley Cardiology.",
        whatYouOwe: "$0.00 right now. This is a medical safety document, not a bill.",
        riskAndTiming: "Moderate daily caution: never pause your blood thinner medication without talking directly to Dr. Sharma's clinic."
      },
      urgency: 'soon',
      urgencyNote: "Schedule 14-day follow-up with Dr. Sharma",
      deadline: 'November 16, 2024',
      glossaryTerms: [
        {
          term: 'Dual Antiplatelet Therapy',
          definition: "A pair of medications (aspirin + Plavix) that keep your blood silky smooth so blood clots cannot stick to the new metal stent in your heart."
        },
        {
          term: 'Femoral Access Site',
          definition: "The small insertion puncture in your upper thigh / groin area where the doctor gently guided the heart tube during the procedure."
        },
        {
          term: 'PO QAM / QPM',
          definition: "Medical abbreviation shorthand: 'PO' means by mouth; 'QAM' means every morning, and 'QPM' means every night with dinner or bedtime."
        }
      ],
      nextSteps: [
        {
          title: 'Step 1: Set a daily morning alarm for Clopidogrel (Plavix)',
          detail: 'Take 75mg every morning with a glass of water. Do not skip a single dose.',
          mostUrgent: true,
          completed: false
        },
        {
          title: "Step 2: Confirm your 14-day follow-up appointment",
          detail: "Call Dr. Sharma's clinic at (555) 014-9920 to confirm your visit time for next week.",
          mostUrgent: false,
          completed: false
        },
        {
          title: 'Step 3: Rest and observe the thigh puncture site',
          detail: 'Avoid lifting heavy groceries, laundry baskets, or vacuum cleaners until the 10-day rest period is complete.',
          mostUrgent: false,
          completed: true
        }
      ],
      callScript: "Hello, my name is Margaret Miller (DOB 04/12/1948). I was discharged following a stent placement and I am calling to confirm my 14-day post-procedure follow-up appointment with Dr. Sharma."
    }
  },
  {
    id: 'bank-escrow',
    title: 'Bank Escrow Adjustment',
    shortLabel: 'Bank Escrow Adjustment',
    type: 'Annual Home Escrow Account Statement',
    billedAmount: '$318.20',
    date: 'October 28, 2024',
    formId: 'Notice ESC-402',
    originalText: `FIRST HORIZON HOME MORTGAGE SERVICES
ANNUAL ESCROW ACCOUNT DISCLOSURE STATEMENT (RESPA NOTICE ESC-402)
Borrower: MARGARET E. MILLER | Loan Number: #9482-1049-01
Property Address: 742 Evergreen Terrace

REASON FOR NOTIFICATION: ANNUAL ESCROW RECONCILIATION
Due to an increase in municipal property taxes and homeowner insurance premium disbursements over the prior 12-month billing period, your escrow account reflects a calculated shortage of $318.20.

NEW MONTHLY PAYMENT BREAKDOWN (Effective Dec 1, 2024):
- Principal & Interest: $684.10
- Prior Escrow Portion: $240.00
- New Escrow Portion: $266.51 (includes $26.51/mo shortage spread over 12 months)
- Total New Monthly Mortgage Payment: $950.61 (an increase of $26.51/month)

PAYMENT OPTIONS:
1. Do nothing: Your payment will automatically adjust to $950.61 starting December 1st.
2. Pay the one-time $318.20 shortage by check or online before Nov 25th, keeping your monthly escrow increase to $0.`,
    explanation: {
      documentType: 'Annual Mortgage Escrow Statement (Notice ESC-402)',
      plainSummary: "Your local county property taxes went up slightly this year. You are not in trouble or behind on payments. Your monthly mortgage payment will simply increase by $26.51 a month starting December 1st.",
      atAGlance: {
        whatItIs: "A routine annual bank statement recalculating your property taxes and homeowner insurance savings bucket (escrow).",
        whatYouOwe: "$26.51 more each month starting December 1st (or you can pay a one-time $318.20 payment if you prefer).",
        riskAndTiming: "Zero risk to your home. No penalty fees apply. Simply update your automated bank withdrawal if it is not automatic."
      },
      urgency: 'none',
      urgencyNote: "No urgent action needed • Automatic adjustment starts Dec 1",
      deadline: 'December 1, 2024',
      glossaryTerms: [
        {
          term: 'Escrow Shortage',
          definition: "A normal annual difference when your town's property taxes or home insurance cost a few dollars more than the bank estimated 12 months ago."
        },
        {
          term: 'RESPA',
          definition: "Real Estate Settlement Procedures Act: A federal consumer-protection law requiring banks to send you this exact transparent math sheet every year."
        },
        {
          term: 'Disbursement',
          definition: "The bank paying your county tax collector or insurance agency directly from your savings bucket on your behalf."
        }
      ],
      nextSteps: [
        {
          title: 'Step 1: Check your automated bank bill-pay',
          detail: 'If your bank automatically drafts your mortgage payment, make sure your account has $950.61 ready for December 1st.',
          mostUrgent: false,
          completed: false
        },
        {
          title: 'Step 2: Decide if you want to pay the one-time $318.20 check',
          detail: 'Most families simply choose the $26.51/month spread because it requires zero extra paperwork.',
          mostUrgent: false,
          completed: true
        }
      ],
      callScript: "Hello, my name is Margaret Miller. I am calling regarding loan #9482-1049-01. I received my annual escrow disclosure statement and would like to confirm that my monthly auto-debit will automatically update to $950.61 for the December 1st payment."
    }
  }
];
