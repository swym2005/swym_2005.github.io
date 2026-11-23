export const projects = [
  {
    slug: 'customer-churn', number: '01', category: 'Customer analytics', theme: 'churn',
    title: 'Customer Churn Analytics', subtitle: 'Understanding who leaves, and where retention matters most.',
    summary: 'Connected customer, subscription, and support data to uncover cancellation patterns across 5,000 OTT subscribers.',
    tools: ['Python', 'SQLite', 'Power BI', 'Pandas', 'NumPy'],
    metrics: [['5,000', 'OTT subscribers'], ['28.64%', 'Customer churn rate'], ['17,707.68', 'Lost monthly charges¹']],
    question: 'Which subscribers are canceling, where do recurring-charge losses concentrate, and which customer groups deserve retention attention?',
    context: 'An OTT subscription analysis bringing demographics, subscription terms, and support interactions into one customer-level view. A subscriber is classified as churned when a cancellation date is present.',
    steps: [
      ['Connect three sources', 'Used SQLite and pandas to extract customer, subscription, and support tables. Customer and subscription records each contain 5,000 subscribers; support contains 5,000 interactions across 2,856 customers.'],
      ['Preserve the right level of detail', 'A direct support join created 7,144 rows. Calculated complaint frequency and retained the latest support interaction before left-joining to produce exactly one row per subscriber.'],
      ['Prepare meaningful features', 'Standardized labels, filled missing country values from state mappings, and created churn flags, age, tenure, complaint counts, and score-based risk bands. Kept customers without support history in the analysis.'],
      ['Turn analysis into reporting', 'Compared plans, contracts, channels, support patterns, and locations with Python, then built a Power BI dashboard for subscriber KPIs, cancellation trends, and recurring-charge exposure.']
    ],
    findings: [
      ['Basic plans need attention', 'Basic subscribers recorded 60.64% churn, versus 22.57% for Standard and 14.58% for Premium. Basic accounts contributed 701 of the 1,432 cancellations.'],
      ['Contract terms reveal a gap', 'Monthly contracts recorded 55.15% churn, compared with 8.72% for annual contracts — approximately 6.32 times the rate.'],
      ['Support adds context', 'The latest escalation indicator had an approximately 0.42 Pearson correlation with churn. Escalated customers represent a useful group for further retention investigation.'],
      ['Volume and rate tell different stories', 'Delhi recorded the largest cancellation volume at 281. Rajasthan had the highest location churn rate at 32.92%, indicating different regional priorities.']
    ],
    comparison: { title: 'Churn by subscription plan', unit: '%', rows: [['Basic',60.64],['Standard',22.57],['Premium',14.58]], note: 'Canceled subscribers ÷ subscribers within each plan. Report, p. 8.' },
    recommendations: ['Test targeted retention offers for Basic and monthly-plan subscribers.', 'Review referral onboarding and offer terms, alongside the plan and contract mix.', 'Prioritize unresolved or repeated complaints and evaluate campaigns using retained revenue, retention, and satisfaction.'],
    boundary: 'These are descriptive relationships, not proof of why customers cancel. Recommended campaigns have not been presented as implemented results. ¹ Financial values are in unspecified currency units; lost monthly charges measure canceled accounts’ recurring charges, not cumulative realized losses.',
    images: [{src:'churn-dashboard-0.png',alt:'Customer Churn Analytics Power BI dashboard with subscriber KPIs, plan and contract churn, monthly cancellations, and geography.',caption:'Power BI dashboard · Original screenshot from the project report, p. 11.'}],
    report: 'customer-churn-analytics.pdf', source: 'Customer Churn Analytics Report, pp. 3–12; resume.'
  },
  {
    slug:'vehicle-loan-credit-risk', number:'02', category:'Credit risk', theme:'credit',
    title:'Vehicle Loan Credit Risk', subtitle:'Finding early repayment risk across a large lending portfolio.',
    summary:'Analyzed 233,154 vehicle loans to compare first-EMI defaults across financing, bureau history, and credit behavior.',
    tools:['Python','MySQL','Power BI','DAX','SQLAlchemy'],
    metrics:[['233,154','Vehicle loan records'],['21.71%','First-EMI default rate'],['1,267.36 Cr','Total principal disbursed']],
    question:'Where are first-instalment defaults concentrated, and which borrower and financing segments warrant closer credit review?',
    context:'A historical vehicle-finance dataset with 41 source columns, 22 encoded state IDs, and 82 branches. Each record represents one loan; the outcome is whether a payment default occurred on its first EMI due date.',
    steps:[
      ['Extract and validate', 'Connected MySQL to pandas through SQLAlchemy and PyMySQL. Checked the 233,154 records, source types, missing fields, and unique identifiers; no duplicate UniqueID values were found.'],
      ['Prepare borrower attributes', 'Retained all loans, labelled 7,661 missing employment values as Unknown, parsed dates, and calculated age at disbursement rather than at the time of analysis.'],
      ['Build interpretable risk segments', 'Created LTV, loan-size, age, bureau-risk, prior-default, delinquency, and inquiry groups. Kept No Bureau History separate from scored risk tiers.'],
      ['Design portfolio reporting', 'Calculated loan counts, defaults, rates, and disbursements, then developed a two-page Power BI dashboard with five core portfolio KPIs and state, employment, and date filters.']
    ],
    findings:[
      ['Higher LTV, higher observed risk', 'Default incidence rose from 13.90% in the 0–60% LTV band to 25.88% at 80–90%. The 90–100% band recorded 20.61%, but included only 883 loans.'],
      ['Credit history differentiates segments', 'Very High Risk borrowers recorded 30.18% defaults, compared with 15.81% for Very Low Risk. Two or more previously defaulted primary accounts were associated with a 28.88% rate.'],
      ['Inquiry frequency flags a review group', 'Borrowers with three or more credit inquiries recorded 32.07% defaults, versus 21.07% among borrowers with none.'],
      ['No history is its own population', '116,950 loans — 50.16% of the portfolio — had no bureau history. Their 23.13% default rate supports separate treatment rather than assigning a conventional score tier.']
    ],
    comparison:{title:'First-EMI default by bureau segment',unit:'%',rows:[['Very low risk',15.81],['No bureau history',23.13],['High risk',27.01],['Very high risk',30.18]],note:'Observed loan-level default rates. Report, p. 9. No bureau history is a separate population.'},
    recommendations:['Review elevated-LTV applications alongside affordability and loan mix.', 'Include prior defaults and concentrated inquiry activity in additional verification.', 'Evaluate thin-file applicants separately and monitor state and branch patterns with volume and risk-mix controls.'],
    boundary:'First-EMI default is not lifetime default probability or realized financial loss. Disbursement is original principal advanced, not outstanding exposure. Segment comparisons are descriptive and require validation across additional lending cohorts before policy deployment.',
    images:[{src:'credit-dashboard-3.png',alt:'Loan Portfolio Overview Power BI dashboard with loan totals, default rate, disbursement, LTV, age, and employment comparisons.',caption:'Page 1 · Loan Portfolio Overview. Original dashboard screenshot from report p. 11.'},{src:'credit-dashboard-4.png',alt:'Credit Risk and Default Analysis Power BI dashboard showing bureau tiers, inquiries, overdue accounts, and credit history.',caption:'Page 2 · Credit Risk & Default Analysis. Original dashboard screenshot from report p. 11.'}],
    report:'vehicle-loan-credit-risk.pdf', source:'Loan Default & Credit Risk Analysis Report, pp. 3–12; resume.'
  },
  {
    slug:'customer-shopping-behavior', number:'03', category:'Retail analytics', theme:'shopping',
    title:'Customer Shopping Behavior', subtitle:'From retail transactions to customer and product patterns.',
    summary:'Prepared retail data in Python and used PostgreSQL to examine purchase patterns, customer loyalty, and product preferences.',
    tools:['Python','Pandas','PostgreSQL','SQL','Power BI'],
    metrics:[['3,900','Customers in SQL results'],['37','Missing ratings treated'],['4','Age groups compared']],
    question:'How can shopping data reveal customer preferences and support more focused marketing and product decisions?',
    context:'A retail analysis workflow documented through Python preparation, SQL queries and outputs, and a Power BI reporting plan. The report explores purchase amounts, subscriptions, product categories, discounts, reviews, and repeat purchases.',
    steps:[
      ['Clean the shopping dataset', 'Inspected missing values and filled 37 missing review ratings using the median within each product category, preserving category-level differences.'],
      ['Engineer useful categories', 'Used pandas qcut to create age groups and mapped textual purchase frequencies to days. Removed promo_code_used after identifying redundancy with discount_applied.'],
      ['Analyze in PostgreSQL', 'Loaded the prepared DataFrame into PostgreSQL through SQLAlchemy. Used aggregations, conditional CASE expressions, common table expressions, and ROW_NUMBER to compare spending and rank products within categories.'],
      ['Define the reporting layer', 'Outlined Power BI measures for customer count, average review rating, and average purchase amount, with categorical filters for subscriptions, gender, age, and product type.']
    ],
    findings:[
      ['A large repeat-customer segment', 'The report’s purchase-history segmentation counted 3,116 Loyal, 701 Returning, and 83 New customers. These are rule-based groups defined in the SQL.'],
      ['Similar average spend by subscription', 'Subscribers averaged 59.49 in purchase amount, compared with 59.87 for non-subscribers. Subscription status alone did not show higher average spending in these outputs.'],
      ['Age-group contributions differ', 'Young Adults contributed 62,143 in purchase value, followed by Middle Aged at 59,197, Adults at 55,978, and Seniors at 55,763.'],
      ['Product-level ranking adds detail', 'Window functions identified the top three products within each category. Conditional aggregation also compared the proportion of discounted purchases by product.']
    ],
    comparison:{title:'Customers by purchase-history segment',unit:'',rows:[['Loyal',3116],['Returning',701],['New',83]],note:'Counts reproduced from the report’s SQL output, p. 8. Segment labels follow the report’s CASE rules.'},
    recommendations:['Compare customer groups using both average spend and total contribution.', 'Use product rankings and discount patterns to form merchandising hypotheses.', 'Validate proposed loyalty or marketing actions with controlled evaluation before claiming an improvement.'],
    boundary:'The supplied report contains SQL outputs and Power BI setup guidance, rather than a completed dashboard screenshot. Spending figures retain the source’s unspecified currency units. The findings do not establish the causal effect of subscriptions, discounts, or shipping options.',
    images:[],report:'customer-shopping-behavior.pdf',source:'PROJECT.pdf, pp. 2–9. Customer count is the sum of the reported subscription groups (2,847 + 1,053).'
  },
  {
    slug:'supply-chain-operations', number:'04', category:'Operations analytics', theme:'supply',
    title:'Supply Chain Operations', subtitle:'A closer look at delivery performance and profitability.',
    summary:'Examined 180,519 order items to identify late-delivery patterns, loss-making orders, and concentrated product value.',
    tools:['Python','Pandas','SQL','Power BI'],
    metrics:[['180,519','Order items analyzed'],['57.31%','Late non-canceled shipments'],['12.00%','Profit margin']],
    question:'Where do delivery performance and profitability vary across orders, shipping modes, and product categories?',
    context:'An operations analysis spanning 65,752 orders, 20,652 customers, and 50 product categories. This case-study summary is based on the project description in my resume.',
    steps:[
      ['Examine the order-item dataset', 'Analyzed 180,519 order items with Python and Pandas, covering delivery performance, profitability, and sales.'],
      ['Compare delivery performance', 'Measured late delivery among non-canceled shipments and compared shipping modes to identify performance gaps.'],
      ['Evaluate commercial performance', 'Assessed order value after discounts, profit margin, loss-making orders, and category-level concentration.']
    ],
    findings:[
      ['Delays affect a majority of shipments', '57.31% of non-canceled shipments arrived late, with delays averaging 1.62 days.'],
      ['Margin hides unprofitable orders', 'The analysis evaluated 33.05 million in post-discount order value and a 12.00% profit margin, while identifying 13,909 loss-making orders.'],
      ['Value is concentrated in a few categories', 'Three of the 50 product categories contributed 42.08% of order value.']
    ],
    comparison:{title:'Concentration of order value',unit:'%',rows:[['Top 3 categories',42.08],['Other 47 categories',57.92]],note:'Top-three share from the resume; remaining share calculated as 100% − 42.08%.'},
    recommendations:['Investigate delivery gaps by shipping mode.', 'Examine the drivers of loss-making orders alongside the overall margin.', 'Review the operational importance of the categories contributing the most order value.'],
    boundary:'Only the resume summary was supplied for this project. The source does not specify the monetary currency or document an implemented business improvement; no reduction in delays or increase in profit is claimed here.',
    images:[],report:null,source:'Swayam Dalal — Data Analyst Resume, Projects section.'
  }
];
