// PrintPal Leads & Customer Module — Main Controller & View Layer
// Faithfully implements Desktop - 1, Desktop - 2, and Desktop - 3 specifications from Figma.
// Brand Colors: Charcoal Ink (#202428), Slate Grey (#737B84), Border Light (#DCE1E5),
// Brand Orange (#D7440E), Active Blue (#2878D0), Surface Light (#F3F5F7).

import './leads.css';
import type { CustomerRecord, EnquiryRecord, ServiceItem, SiteRecord } from './types';

const STORAGE_CUSTOMERS_KEY = 'printpal_workshop_customers_v3';
const STORAGE_ENQUIRIES_KEY = 'printpal_workshop_enquiries_v3';

export class LeadsController {
  private container: HTMLElement;
  private activeTab: 'customer' | 'enquiry' = 'customer';
  private customers: CustomerRecord[] = [];
  private enquiries: EnquiryRecord[] = [];

  // Modal State — New Customer modal sliding up from bottom (Desktop - 3)
  private isModalOpen: boolean = false;
  private editingCustomerId: string | null = null;
  private activeRightTab: 'services' | 'billing' = 'services';
  private collapsedSites: Set<string> = new Set();

  // Multi-Site Modal State (Desktop - 2)
  private selectedCustomerForSites: CustomerRecord | null = null;

  // Notch State
  private isNotchExpanded = false;

  // New Customer Form State
  private formBasicDetails = {
    businessName: '',
    primaryContactName: '',
    primaryContactNumber: '',
    isWhatsAppSame: true,
    email: '',
    followUpDate: '',
  };

  private billingDetails = {
    billingName: '',
    gstin: '',
    billingAddress: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600051',
  };

  private formSites: SiteRecord[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadState();
    this.initDefaultSites();
    this.render();
    this.setupGlobalShortcuts();
  }

  private initDefaultSites() {
    this.formSites = [
      {
        id: 'site-1',
        siteName: '',
        address: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        targetDeliveryDate: '',
        services: ['ACP Glow Sign'],
        mountingHeightAglFt: 10,
        wallSubstrate: 'ACP',
        hasPowerPoint: true,
        powerDistanceM: 2.5,
        serviceDetails: [
          {
            id: 'srv-1',
            serviceNumber: 1,
            signStyle: '',
            application: 'Indoor',
            width: '',
            height: '',
            unit: 'ft',
            quantity: 1,
            referenceFiles: [],
            notes: '',
          },
        ],
      },
    ];
  }

  private loadState() {
    try {
      const savedCustomers = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      if (savedCustomers) {
        this.customers = JSON.parse(savedCustomers);
      } else {
        // By default, initialize with Desktop - 2 sample data
        this.customers = this.getDesktop2SampleCustomers();
        this.saveCustomers();
      }

      const savedEnquiries = localStorage.getItem(STORAGE_ENQUIRIES_KEY);
      if (savedEnquiries) {
        this.enquiries = JSON.parse(savedEnquiries);
      } else {
        this.enquiries = [
          {
            id: 'enq-1',
            contactName: 'Rajesh Kumar',
            phone: '+91 98401 23456',
            email: 'rajesh@chaipoint.com',
            address: '100ft Road, Indiranagar, Bangalore',
            source: 'WHATSAPP',
            stage: 'QUALIFYING',
            inquiryNote: '12x3 ft ACP glow sign with Samsung 3-LED modules',
            hasVectorLogo: true,
            wallSubstrate: 'CONCRETE',
            mountingHeightFt: 10,
            hasPowerPoint: true,
            createdAt: new Date().toISOString(),
          },
        ];
        this.saveEnquiries();
      }
    } catch {
      this.customers = this.getDesktop2SampleCustomers();
      this.enquiries = [];
    }
  }

  private saveCustomers() {
    localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(this.customers));
  }

  private saveEnquiries() {
    localStorage.setItem(STORAGE_ENQUIRIES_KEY, JSON.stringify(this.enquiries));
  }

  private getDesktop2SampleCustomers(): CustomerRecord[] {
    return [
      {
        id: 'cust-1',
        businessName: 'John Doe',
        name: 'John Doe',
        phone: '+91 9876543210',
        email: 'john@gmail.com',
        address: 'No.1/16 abc street, DEF nagar, Chennai - 600051',
        createdAt: new Date().toISOString(),
        sites: [
          {
            id: 'site-101',
            siteName: 'Main Store',
            address: 'No.1/16 abc street, DEF nagar, Chennai - 600051',
            addressLine1: 'No.1/16 abc street',
            addressLine2: 'DEF nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600051',
            services: ['ACP Glow Sign'],
            mountingHeightAglFt: 8,
            wallSubstrate: 'CONCRETE',
            hasPowerPoint: true,
            powerDistanceM: 2,
            serviceDetails: [
              {
                id: 'srv-101',
                serviceNumber: 1,
                signStyle: 'ACP Glow Sign',
                application: 'Outdoor',
                width: '12',
                height: '3',
                unit: 'ft',
                quantity: 1,
                referenceFiles: ['elevation-sketch.jpg'],
                notes: 'Backlit with 6500K cool white LED modules',
              },
            ],
          },
        ],
      },
      {
        id: 'cust-2',
        businessName: 'John Doe',
        name: 'John Doe',
        phone: '+91 9876543210',
        email: 'john@gmail.com',
        address: 'No.1/16 abc street, DEF nagar, Chennai - 600051',
        createdAt: new Date().toISOString(),
        sites: [
          {
            id: 'site-201',
            siteName: 'Site 1: Anna Nagar Flagship',
            address: 'No.1/16 abc street, DEF nagar, Chennai - 600051',
            addressLine1: 'No.1/16 abc street',
            addressLine2: 'DEF nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600051',
            services: ['ACP Glow Sign', 'Acrylic 3D LED Letters'],
            mountingHeightAglFt: 12,
            wallSubstrate: 'ACP',
            hasPowerPoint: true,
            powerDistanceM: 3,
            serviceDetails: [
              {
                id: 'srv-201',
                serviceNumber: 1,
                signStyle: 'ACP Glow Sign',
                application: 'Outdoor',
                width: '20',
                height: '4',
                unit: 'ft',
                quantity: 1,
                notes: 'Black 3mm ACP routed front, golden acrylic 3D profile',
              },
            ],
          },
          {
            id: 'site-202',
            siteName: 'Site 2: T. Nagar High Street',
            address: '42 Usman Road, T. Nagar, Chennai - 600017',
            addressLine1: '42 Usman Road',
            addressLine2: 'T. Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600017',
            services: ['Acrylic 3D LED Letters', 'Pylon Signage'],
            mountingHeightAglFt: 14,
            wallSubstrate: 'CONCRETE',
            hasPowerPoint: true,
            powerDistanceM: 5,
          },
          {
            id: 'site-203',
            siteName: 'Site 3: Velachery Center',
            address: '14 Bypass Road, Velachery, Chennai - 600042',
            addressLine1: '14 Bypass Road',
            addressLine2: 'Velachery',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600042',
            services: ['Pylon Signage', 'Directional & Wayfinding'],
            mountingHeightAglFt: 18,
            wallSubstrate: 'CONCRETE',
            hasPowerPoint: true,
            powerDistanceM: 4,
          },
          {
            id: 'site-204',
            siteName: 'Site 4: OMR Tech Hub',
            address: '5th Floor, Ascendas IT Park, OMR, Chennai - 600113',
            addressLine1: '5th Floor, Ascendas IT Park',
            addressLine2: 'OMR',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600113',
            services: ['Directional & Wayfinding', 'Safety & Exit Signage'],
            mountingHeightAglFt: 9,
            wallSubstrate: 'GLASS',
            hasPowerPoint: true,
            powerDistanceM: 1,
          },
        ],
      },
    ];
  }

  private setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isModalOpen) {
          this.closeNewCustomerModal();
        } else if (this.selectedCustomerForSites) {
          this.selectedCustomerForSites = null;
          this.render();
        } else if (this.isNotchExpanded) {
          this.isNotchExpanded = false;
          this.render();
        }
      }
    });
  }

  // ── Master Render Loop ──
  public render() {
    this.container.innerHTML = '';
    const shell = document.createElement('div');
    shell.className = 'printpal-leads-container';

    // 1. Top Navbar (PrintPal, Nav links, JD profile)
    shell.appendChild(this.buildTopNavbar());

    // 2. Docked Top PAL Notch
    shell.appendChild(this.buildDockedPalNotch());

    // 3. Main Body: Leads Header + Table Card (Desktop - 1 & 2)
    const content = document.createElement('main');
    content.className = 'printpal-content-body';
    content.appendChild(this.buildLeadsHeader());
    content.appendChild(this.buildTableCard());
    shell.appendChild(content);

    // 4. Modal Sheet: Slides up from bottom (Desktop - 3)
    shell.appendChild(this.buildNewCustomerModal());

    // 5. Multi-Site Popover / Modal (Desktop - 2)
    if (this.selectedCustomerForSites) {
      shell.appendChild(this.buildMultiSitesModal(this.selectedCustomerForSites));
    }

    this.container.appendChild(shell);
  }

  // ── 1. Top Navigation Bar (Desktop - 1, 2, 3) ──
  private buildTopNavbar(): HTMLElement {
    const nav = document.createElement('header');
    nav.className = 'printpal-top-nav';

    // Left: Brand + Nav Links
    const left = document.createElement('div');
    left.className = 'printpal-nav-left';

    const brand = document.createElement('div');
    brand.className = 'printpal-brand-title';
    brand.textContent = 'PrintPal';
    brand.onclick = () => {
      this.closeNewCustomerModal();
    };

    const links = document.createElement('div');
    links.className = 'printpal-nav-links';

    // Leads Link (Active: Orange text & Underline)
    const linkLeads = document.createElement('button');
    linkLeads.className = 'printpal-nav-link active';
    linkLeads.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <span>Leads</span>
    `;
    linkLeads.onclick = () => {
      this.closeNewCustomerModal();
    };

    // Quotation Link (Inactive)
    const linkQuote = document.createElement('button');
    linkQuote.className = 'printpal-nav-link';
    linkQuote.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span>Quotation</span>
    `;
    linkQuote.onclick = () => {
      this.showToast('Quotation Module: Select a lead to generate HSN 9405 quote');
    };

    links.appendChild(linkLeads);
    links.appendChild(linkQuote);

    left.appendChild(brand);
    left.appendChild(links);

    // Right: User Profile Pill (Gold JD Avatar + John Doe + Chevron)
    const right = document.createElement('div');
    right.className = 'printpal-nav-right';

    const userPill = document.createElement('div');
    userPill.className = 'printpal-user-pill';
    userPill.title = 'Account: John Doe';
    userPill.innerHTML = `
      <div class="printpal-avatar">JD</div>
      <span class="printpal-user-name">John Doe</span>
      <svg class="printpal-user-chevron" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    userPill.onclick = () => {
      this.showToast('Logged in as Estimator Lead: John Doe');
    };

    right.appendChild(userPill);

    nav.appendChild(left);
    nav.appendChild(right);
    return nav;
  }

  // ── 2. Top DOCKED PAL NOTCH ──
  private buildDockedPalNotch(): HTMLElement {
    const dock = document.createElement('div');
    dock.className = 'printpal-notch-dock';

    const shell = document.createElement('div');
    shell.className = `printpal-notch-shell ${this.isNotchExpanded ? 'expanded' : 'collapsed'}`;

    if (!this.isNotchExpanded) {
      shell.onclick = () => {
        this.isNotchExpanded = true;
        this.render();
      };
      shell.innerHTML = `
        <div class="printpal-notch-left">
          <span class="printpal-notch-pulse"></span>
          <span class="printpal-notch-title">PAL</span>
          <span class="printpal-notch-status">Workshop Ready</span>
        </div>
        <div class="printpal-notch-lens"></div>
      `;
    } else {
      const header = document.createElement('div');
      header.className = 'printpal-notch-exp-header';
      header.innerHTML = `
        <div class="printpal-notch-exp-brand">
          <span class="printpal-notch-pulse"></span>
          <span class="printpal-notch-exp-title">PAL Workshop Intelligence & Guard</span>
        </div>
      `;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'printpal-notch-exp-close';
      closeBtn.innerHTML = '✕';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.isNotchExpanded = false;
        this.render();
      };
      header.appendChild(closeBtn);
      shell.appendChild(header);

      const metrics = document.createElement('div');
      metrics.className = 'printpal-notch-exp-metrics';
      metrics.innerHTML = `
        <div class="printpal-notch-metric-card">
          <div class="printpal-notch-metric-label">Active Workshop Bay</div>
          <div class="printpal-notch-metric-val">Ruida 1390 Laser & CNC</div>
        </div>
        <div class="printpal-notch-metric-card">
          <div class="printpal-notch-metric-label">SMPS Derate Guard</div>
          <div class="printpal-notch-metric-val">1.25x Active (300W Safe)</div>
        </div>
        <div class="printpal-notch-metric-card">
          <div class="printpal-notch-metric-label">Sheet Optimization</div>
          <div class="printpal-notch-metric-val">8x4ft ACP Zero-Scrap Ready</div>
        </div>
        <div class="printpal-notch-metric-card">
          <div class="printpal-notch-metric-label">Commercial Gate</div>
          <div class="printpal-notch-metric-val">50/40/10 Milestone Lock</div>
        </div>
      `;
      shell.appendChild(metrics);

      const actions = document.createElement('div');
      actions.className = 'printpal-notch-actions';

      const btn1 = document.createElement('button');
      btn1.className = 'printpal-notch-action-btn';
      btn1.textContent = '📐 Nest Sheets';
      btn1.onclick = () => {};

      const btn2 = document.createElement('button');
      btn2.className = 'printpal-notch-action-btn';
      btn2.textContent = '⚡ Check LEDs';
      btn2.onclick = () => {};

      actions.appendChild(btn1);
      actions.appendChild(btn2);
      shell.appendChild(actions);

      const promptBox = document.createElement('div');
      promptBox.className = 'printpal-notch-prompt-box';
      promptBox.innerHTML = `
        <input type="text" class="printpal-notch-prompt-input" placeholder="Ask PAL about materials, derating, or costs..." />
        <button class="printpal-notch-prompt-btn">Ask</button>
      `;
      const pBtn = promptBox.querySelector('button');
      pBtn?.addEventListener('click', () => {
        const inp = promptBox.querySelector('input') as HTMLInputElement;
        if (inp?.value) {
          inp.value = '';
        }
      });
      shell.appendChild(promptBox);
    }

    dock.appendChild(shell);
    return dock;
  }

  // ── 3. Leads Header & Controls (Desktop - 1 & 2) ──
  private buildLeadsHeader(): HTMLElement {
    const header = document.createElement('section');
    header.className = 'printpal-leads-header';

    const titleBlock = document.createElement('div');
    titleBlock.className = 'printpal-leads-title-block';

    const title = document.createElement('h1');
    title.className = 'printpal-leads-title';
    title.textContent = 'Leads';

    const subtitle = document.createElement('div');
    subtitle.className = 'printpal-leads-subtitle';
    subtitle.textContent = 'Manage and track your enquiries, customers and their requirements';

    titleBlock.appendChild(title);
    titleBlock.appendChild(subtitle);

    const controls = document.createElement('div');
    controls.className = 'printpal-leads-controls';

    // Segmented Toggle [ Customer | Enquiry ]
    const toggle = document.createElement('div');
    toggle.className = 'printpal-segmented-toggle';

    const btnCustomer = document.createElement('button');
    btnCustomer.className = `printpal-segment-btn ${this.activeTab === 'customer' ? 'active' : ''}`;
    btnCustomer.textContent = 'Customer';
    btnCustomer.onclick = () => {
      this.activeTab = 'customer';
      this.render();
    };

    const btnEnquiry = document.createElement('button');
    btnEnquiry.className = `printpal-segment-btn ${this.activeTab === 'enquiry' ? 'active' : ''}`;
    btnEnquiry.textContent = 'Enquiry';
    btnEnquiry.onclick = () => {
      this.activeTab = 'enquiry';
      this.render();
    };

    toggle.appendChild(btnCustomer);
    toggle.appendChild(btnEnquiry);

    // Primary Action Button: "Add new Customer" (Orange #D7440E)
    const btnAction = document.createElement('button');
    btnAction.className = 'printpal-btn-primary';
    btnAction.id = 'btn-add-customer';
    btnAction.textContent = this.activeTab === 'customer' ? 'Add new Customer' : 'Add new Enquiry';
    btnAction.onclick = () => {
      this.openNewCustomerModal();
    };

    controls.appendChild(toggle);
    controls.appendChild(btnAction);

    header.appendChild(titleBlock);
    header.appendChild(controls);
    return header;
  }

  // ── 4. Table Card (Empty State Desktop - 1 vs Populated State Desktop - 2) ──
  private buildTableCard(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'printpal-table-card';

    // Table Header Row
    const thead = document.createElement('div');
    thead.className = 'printpal-table-header';
    thead.innerHTML = `
      <div>Name</div>
      <div>Number</div>
      <div>Email</div>
      <div>Site Address</div>
      <div>Actions</div>
    `;
    card.appendChild(thead);

    if (this.customers.length === 0) {
      // ── Desktop - 1: Empty State ──
      const empty = document.createElement('div');
      empty.className = 'printpal-table-empty';
      empty.textContent = 'No Customersfound. Add a new one to view its details';
      card.appendChild(empty);
    } else {
      // ── Desktop - 2: Populated Table Rows ──
      this.customers.forEach((cust) => {
        const row = document.createElement('div');
        row.className = 'printpal-table-row';

        // 1. Name
        const cellName = document.createElement('div');
        cellName.className = 'printpal-cell-name';
        cellName.textContent = cust.name;

        // 2. Number
        const cellNum = document.createElement('div');
        cellNum.className = 'printpal-cell-number';
        cellNum.textContent = cust.phone;

        // 3. Email
        const cellEmail = document.createElement('div');
        cellEmail.className = 'printpal-cell-email';
        cellEmail.textContent = cust.email || '—';

        // 4. Site Address + Multiple Sites link
        const cellAddress = document.createElement('div');
        cellAddress.className = 'printpal-cell-address';

        const addrLine = document.createElement('span');
        addrLine.textContent = cust.address;
        cellAddress.appendChild(addrLine);

        // Multiple Sites Link (Desktop - 2)
        if (cust.sites && cust.sites.length > 1) {
          const multiWrapper = document.createElement('div');
          multiWrapper.className = 'printpal-multi-sites-wrapper';
          multiWrapper.innerHTML = `
            <span>has </span>
            <a href="#" class="printpal-multi-sites-link">Multiple Sites (${cust.sites.length})</a>
          `;
          const link = multiWrapper.querySelector('.printpal-multi-sites-link');
          link?.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectedCustomerForSites = cust;
            this.render();
          });
          cellAddress.appendChild(multiWrapper);
        }

        // 5. Actions: Edit Icon Button
        const cellActions = document.createElement('div');
        cellActions.className = 'printpal-cell-actions';

        const btnEdit = document.createElement('button');
        btnEdit.className = 'printpal-btn-edit-icon';
        btnEdit.title = 'Edit Customer';
        btnEdit.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
        btnEdit.onclick = () => {
          this.editingCustomerId = cust.id;
          this.formBasicDetails = {
            businessName: cust.businessName || cust.name,
            primaryContactName: cust.name,
            primaryContactNumber: cust.phone,
            isWhatsAppSame: cust.isWhatsAppSame ?? true,
            email: cust.email,
            followUpDate: cust.followUpDate || '',
          };
          this.formSites = cust.sites && cust.sites.length > 0 ? JSON.parse(JSON.stringify(cust.sites)) : this.formSites;
          this.openNewCustomerModal(false);
        };

        cellActions.appendChild(btnEdit);

        row.appendChild(cellName);
        row.appendChild(cellNum);
        row.appendChild(cellEmail);
        row.appendChild(cellAddress);
        row.appendChild(cellActions);

        card.appendChild(row);
      });
    }

    return card;
  }

  // ── 5. New Customer Modal (Desktop - 3 Slide-Up From Bottom) ──
  private buildNewCustomerModal(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = `printpal-modal-overlay ${this.isModalOpen ? 'open' : ''}`;
    overlay.id = 'new-customer-modal-overlay';

    // Backdrop click closes the modal
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        this.closeNewCustomerModal();
      }
    };

    // Modal Sheet Container
    const sheet = document.createElement('div');
    sheet.className = 'printpal-modal-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'modal-sheet-title');

    // ── Fixed Top Header Bar inside Modal (Desktop - 3 & 4) ──
    const headerBar = document.createElement('div');
    headerBar.className = 'printpal-modal-header-bar';

    const title = document.createElement('h2');
    title.className = 'printpal-modal-title-text';
    title.id = 'modal-sheet-title';
    title.textContent = this.editingCustomerId ? 'Edit Customer' : 'New Customer';

    const actions = document.createElement('div');
    actions.className = 'printpal-modal-header-actions';

    const btnCancel = document.createElement('button');
    btnCancel.className = 'printpal-btn-cancel';
    btnCancel.textContent = 'Cancel';
    btnCancel.onclick = () => this.closeNewCustomerModal();

    const btnSave = document.createElement('button');
    btnSave.className = 'printpal-btn-save';
    btnSave.textContent = 'Save';
    btnSave.onclick = () => this.handleSaveCustomer();

    actions.appendChild(btnCancel);
    actions.appendChild(btnSave);

    headerBar.appendChild(title);
    headerBar.appendChild(actions);
    sheet.appendChild(headerBar);

    // ── Scrollable Modal Content Body (Desktop - 3 Two Column Grid) ──
    const contentScroll = document.createElement('div');
    contentScroll.className = 'printpal-modal-scroll-content';

    const grid = document.createElement('div');
    grid.className = 'printpal-new-cust-grid';

    // ── Left Column Card: Basic Details ──
    const leftCard = document.createElement('div');
    leftCard.className = 'printpal-card-basic-details';
    leftCard.innerHTML = `
      <div class="printpal-card-title">Basic Details</div>

      <div class="printpal-form-group">
        <label class="printpal-form-label">Business Name</label>
        <input type="text" id="input-biz-name" class="printpal-form-input" value="${this.formBasicDetails.businessName}" placeholder="" />
      </div>

      <div class="printpal-form-group">
        <label class="printpal-form-label">Primary Contact Name</label>
        <input type="text" id="input-contact-name" class="printpal-form-input" value="${this.formBasicDetails.primaryContactName}" placeholder="" />
      </div>

      <div class="printpal-form-group">
        <label class="printpal-form-label">Primary Contact Number</label>
        <input type="tel" id="input-contact-phone" class="printpal-form-input" value="${this.formBasicDetails.primaryContactNumber}" placeholder="" />
        <label class="printpal-checkbox-label">
          <input type="checkbox" id="input-whatsapp-same" ${this.formBasicDetails.isWhatsAppSame ? 'checked' : ''} />
          <span>WhatsApp number is same as primary contact number</span>
        </label>
      </div>

      <div class="printpal-form-group">
        <label class="printpal-form-label">Email</label>
        <input type="email" id="input-email" class="printpal-form-input" value="${this.formBasicDetails.email}" placeholder="" />
      </div>

      <div class="printpal-form-group">
        <label class="printpal-form-label">Follow-up date</label>
        <input type="date" id="input-followup-date" class="printpal-form-input" value="${this.formBasicDetails.followUpDate}" />
      </div>
    `;

    // ── Right Column: Standalone Tabs Card + Sites / Billing (Desktop - 4) ──
    const rightColumn = document.createElement('div');
    rightColumn.className = 'printpal-right-column';

    // 1. Separate Tabs Card Component (Desktop - 4 Group 19)
    const tabsCard = document.createElement('div');
    tabsCard.className = 'printpal-tabs-card';

    // Tabs Header: [ Services & Site Details (Active Orange Line) | Billing Address ]
    const tabsNav = document.createElement('div');
    tabsNav.className = 'printpal-site-tabs-nav';

    const tabServices = document.createElement('button');
    tabServices.type = 'button';
    tabServices.className = `printpal-site-tab-btn ${this.activeRightTab === 'services' ? 'active' : ''}`;
    tabServices.textContent = 'Services & Site Details';
    tabServices.onclick = () => {
      this.activeRightTab = 'services';
      this.refreshModalContent();
    };

    const tabBilling = document.createElement('button');
    tabBilling.type = 'button';
    tabBilling.className = `printpal-site-tab-btn ${this.activeRightTab === 'billing' ? 'active' : ''}`;
    tabBilling.textContent = 'Billing Address';
    tabBilling.onclick = () => {
      this.activeRightTab = 'billing';
      this.refreshModalContent();
    };

    tabsNav.appendChild(tabServices);
    tabsNav.appendChild(tabBilling);
    tabsCard.appendChild(tabsNav);
    rightColumn.appendChild(tabsCard);

    if (this.activeRightTab === 'services') {
      // 2. Separate Sites Cards Wrapper (Desktop - 4 Rectangle 13)
      const siteCardsWrapper = document.createElement('div');
      siteCardsWrapper.className = 'printpal-sites-wrapper';
      siteCardsWrapper.id = 'site-cards-wrapper';

      this.formSites.forEach((site, index) => {
        const siteCard = this.buildSiteAccordionCard(site, index);
        siteCardsWrapper.appendChild(siteCard);
      });

      rightColumn.appendChild(siteCardsWrapper);

      // Add Another Site Button
      const btnAddSite = document.createElement('button');
      btnAddSite.type = 'button';
      btnAddSite.className = 'printpal-btn-add-another-site';
      btnAddSite.innerHTML = `
        <span style="font-size: 16px; font-weight: 500;">+</span>
        <span>Add Another Site</span>
      `;
      btnAddSite.onclick = () => {
        const newSiteNum = this.formSites.length + 1;
        this.formSites.push({
          id: `site-${Date.now()}`,
          siteName: '',
          address: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          targetDeliveryDate: '',
          services: ['ACP Glow Sign'],
          mountingHeightAglFt: 10,
          wallSubstrate: 'ACP',
          hasPowerPoint: true,
          powerDistanceM: 2,
          serviceDetails: [
            {
              id: `srv-${Date.now()}`,
              serviceNumber: 1,
              signStyle: '',
              application: 'Indoor',
              width: '',
              height: '',
              unit: 'ft',
              quantity: 1,
              referenceFiles: [],
              notes: '',
            },
          ],
        });
        this.refreshModalContent();
        this.showToast(`Site ${newSiteNum} added to customer configuration`);
      };

      rightColumn.appendChild(btnAddSite);
    } else {
      // 3. Separate Billing Address Card (Desktop - 4)
      const billingCard = document.createElement('div');
      billingCard.className = 'printpal-billing-card';
      billingCard.innerHTML = `
        <div class="printpal-form-row-2">
          <div class="printpal-form-group">
            <label class="printpal-form-label">Billing Entity / Company Name</label>
            <input type="text" class="printpal-form-input input-billing-name" value="${this.billingDetails.billingName || this.formBasicDetails.businessName || 'John Doe'}" />
          </div>
          <div class="printpal-form-group">
            <label class="printpal-form-label">GSTIN (Optional / Tax Registered)</label>
            <input type="text" class="printpal-form-input input-billing-gstin" value="${this.billingDetails.gstin}" placeholder="33AAAAA0000A1Z5" />
          </div>
        </div>

        <div class="printpal-form-group">
          <label class="printpal-form-label">Registered Office Address</label>
          <input type="text" class="printpal-form-input input-billing-addr" value="${this.billingDetails.billingAddress}" placeholder="No.1/16 abc street, DEF nagar" />
        </div>

        <div class="printpal-form-row-3">
          <div class="printpal-form-group">
            <label class="printpal-form-label">City</label>
            <input type="text" class="printpal-form-input input-billing-city" value="${this.billingDetails.city}" />
          </div>
          <div class="printpal-form-group">
            <label class="printpal-form-label">State</label>
            <input type="text" class="printpal-form-input input-billing-state" value="${this.billingDetails.state}" />
          </div>
          <div class="printpal-form-group">
            <label class="printpal-form-label">Pincode</label>
            <input type="text" class="printpal-form-input input-billing-pincode" value="${this.billingDetails.pincode}" />
          </div>
        </div>
      `;

      rightColumn.appendChild(billingCard);
    }

    grid.appendChild(leftCard);
    grid.appendChild(rightColumn);
    contentScroll.appendChild(grid);
    sheet.appendChild(contentScroll);
    overlay.appendChild(sheet);

    return overlay;
  }

  // ── Build Individual Site Accordion Card (Desktop - 3) ──
  private buildSiteAccordionCard(site: SiteRecord, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'printpal-site-card';

    const siteNum = index + 1;
    const siteTitleText = site.siteName ? `Site ${siteNum} ( ${site.siteName} )` : `Site ${siteNum} ( Untitled )`;
    const isCollapsed = this.collapsedSites.has(site.id);

    // Site Card Header Bar (#F3F5F7, height 44px, radius 6px)
    const cardHeader = document.createElement('div');
    cardHeader.className = 'printpal-site-card-header';
    cardHeader.innerHTML = `
      <div class="printpal-site-card-title">${siteTitleText}</div>
      <div class="printpal-site-card-tools">
        <button type="button" class="printpal-icon-btn delete" title="Delete Site">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button type="button" class="printpal-icon-btn printpal-btn-collapse" title="Collapse / Expand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s ease;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    `;

    // Delete handler
    cardHeader.querySelector('.printpal-icon-btn.delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.formSites.length > 1) {
        this.formSites.splice(index, 1);
        this.refreshModalContent();
      }
    });

    // Collapse handler
    cardHeader.querySelector('.printpal-btn-collapse')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isCollapsed) {
        this.collapsedSites.delete(site.id);
      } else {
        this.collapsedSites.add(site.id);
      }
      this.refreshModalContent();
    });

    card.appendChild(cardHeader);

    if (!isCollapsed) {
      // Card Body
      const cardBody = document.createElement('div');
      cardBody.className = 'printpal-site-card-body';

      // Extra padding container for site inputs
      const infoFields = document.createElement('div');
      infoFields.className = 'printpal-site-info-fields';
      cardBody.appendChild(infoFields);

      // 1. Location Search Input + "Cant find it ? Enter address manually"
      const searchWrapper = document.createElement('div');
      searchWrapper.className = 'printpal-site-search-wrapper';
      searchWrapper.innerHTML = `
        <svg class="printpal-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="printpal-site-search-input" placeholder="Search the site location (business name or address)" value="${site.address || ''}" />
      `;
      const searchInput = searchWrapper.querySelector('input') as HTMLInputElement;
      searchInput.addEventListener('input', () => {
        site.address = searchInput.value;
      });

      const manualLink = document.createElement('div');
      manualLink.className = 'printpal-manual-address-link';
      manualLink.textContent = 'Cant find it ? Enter address manually';
      manualLink.onclick = () => {
        const addr1 = cardBody.querySelector('.input-addr-1') as HTMLInputElement;
        addr1?.focus();
        this.showToast('Enter specific street address and pin code below');
      };

      infoFields.appendChild(searchWrapper);
      infoFields.appendChild(manualLink);

      // 2. Site Name input
      const grpName = document.createElement('div');
      grpName.className = 'printpal-form-group';
      grpName.innerHTML = `
        <label class="printpal-form-label">Site Name</label>
        <input type="text" class="printpal-form-input input-site-name" value="${site.siteName || ''}" placeholder="" />
      `;
      const nameInput = grpName.querySelector('input') as HTMLInputElement;
      nameInput.addEventListener('input', () => {
        site.siteName = nameInput.value;
        const titleEl = cardHeader.querySelector('.printpal-site-card-title');
        if (titleEl) {
          titleEl.textContent = site.siteName ? `Site ${siteNum} ( ${site.siteName} )` : `Site ${siteNum} ( Untitled )`;
        }
      });
      infoFields.appendChild(grpName);

      // 3. Address Line 1 & Address Line 2
      const rowAddr = document.createElement('div');
      rowAddr.className = 'printpal-form-row-2';
      rowAddr.innerHTML = `
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">Address Line 1</label>
          <input type="text" class="printpal-form-input input-addr-1" value="${site.addressLine1 || ''}" placeholder="" />
        </div>
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">Address Line 2</label>
          <input type="text" class="printpal-form-input input-addr-2" value="${site.addressLine2 || ''}" placeholder="" />
        </div>
      `;
      const a1 = rowAddr.querySelector('.input-addr-1') as HTMLInputElement;
      const a2 = rowAddr.querySelector('.input-addr-2') as HTMLInputElement;
      a1.addEventListener('input', () => (site.addressLine1 = a1.value));
      a2.addEventListener('input', () => (site.addressLine2 = a2.value));
      infoFields.appendChild(rowAddr);

      // 4. City, State, Pincode
      const rowLoc = document.createElement('div');
      rowLoc.className = 'printpal-form-row-3';
      rowLoc.innerHTML = `
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">City</label>
          <input type="text" class="printpal-form-input input-city" value="${site.city || ''}" placeholder="" />
        </div>
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">State</label>
          <input type="text" class="printpal-form-input input-state" value="${site.state || ''}" placeholder="" />
        </div>
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">Pincode</label>
          <input type="text" class="printpal-form-input input-pincode" value="${site.pincode || ''}" placeholder="" />
        </div>
      `;
      const cInput = rowLoc.querySelector('.input-city') as HTMLInputElement;
      const sInput = rowLoc.querySelector('.input-state') as HTMLInputElement;
      const pInput = rowLoc.querySelector('.input-pincode') as HTMLInputElement;
      cInput.addEventListener('input', () => (site.city = cInput.value));
      sInput.addEventListener('input', () => (site.state = sInput.value));
      pInput.addEventListener('input', () => (site.pincode = pInput.value));
      infoFields.appendChild(rowLoc);

      // 5. Target Delivery Date (Half width)
      const rowDel = document.createElement('div');
      rowDel.className = 'printpal-form-row-half';
      rowDel.innerHTML = `
        <div class="printpal-form-group" style="margin-bottom: 0;">
          <label class="printpal-form-label">Target Delivery Date</label>
          <input type="date" class="printpal-form-input input-delivery-date" value="${site.targetDeliveryDate || ''}" />
        </div>
      `;
      const dInput = rowDel.querySelector('.input-delivery-date') as HTMLInputElement;
      dInput.addEventListener('change', () => (site.targetDeliveryDate = dInput.value));
      infoFields.appendChild(rowDel);

      // Divider Line (Line 6 in Figma)
      const divider = document.createElement('div');
      divider.className = 'printpal-form-divider';
      infoFields.appendChild(divider);

      // 6. Services on this site section (Desktop - 3 Exact Specs)
      const servicesSection = document.createElement('div');
      servicesSection.className = 'printpal-services-section';

      const sTitle = document.createElement('div');
      sTitle.className = 'printpal-services-section-title';
      sTitle.textContent = 'Services on this site';
      servicesSection.appendChild(sTitle);

      // If no serviceDetails exists, initialize with 1 default service
      if (!site.serviceDetails || site.serviceDetails.length === 0) {
        site.serviceDetails = [
          {
            id: `srv-${Date.now()}`,
            serviceNumber: 1,
            signStyle: '',
            application: 'Indoor',
            width: '',
            height: '',
            unit: 'ft',
            quantity: 1,
            referenceFiles: [],
            notes: '',
          },
        ];
      }

      const servicesWrapper = document.createElement('div');
      servicesWrapper.className = 'printpal-services-list-wrapper';

      site.serviceDetails.forEach((srv, srvIdx) => {
        const srvBlock = this.buildServiceBlock(srv, srvIdx, site);
        servicesWrapper.appendChild(srvBlock);
      });

      servicesSection.appendChild(servicesWrapper);

      // "+ Add another services" blue link
      const btnAddService = document.createElement('button');
      btnAddService.className = 'printpal-btn-add-another-service';
      btnAddService.textContent = '+ Add another services';
      btnAddService.onclick = (e) => {
        e.preventDefault();
        const nextNum = (site.serviceDetails?.length || 0) + 1;
        site.serviceDetails?.push({
          id: `srv-${Date.now()}-${nextNum}`,
          serviceNumber: nextNum,
          signStyle: '',
          application: 'Indoor',
          width: '',
          height: '',
          unit: 'ft',
          quantity: 1,
          referenceFiles: [],
          notes: '',
        });
        this.refreshModalContent();
      };
      servicesSection.appendChild(btnAddService);

      cardBody.appendChild(servicesSection);
      card.appendChild(cardBody);
    }

    return card;
  }

  // ── Build Service 1 Block (Desktop - 3 exact layout) ──
  private buildServiceBlock(srv: ServiceItem, srvIdx: number, site: SiteRecord): HTMLElement {
    const block = document.createElement('div');
    block.className = 'printpal-service-block-card';

    // Header: "Service 1" + delete button if > 1 service
    const blockHeader = document.createElement('div');
    blockHeader.className = 'printpal-service-block-header';
    blockHeader.innerHTML = `
      <span class="printpal-service-block-title">Service ${srvIdx + 1}</span>
      ${
        (site.serviceDetails?.length || 0) > 1
          ? `<button class="printpal-service-del-btn" title="Remove Service">✕</button>`
          : ''
      }
    `;

    blockHeader.querySelector('.printpal-service-del-btn')?.addEventListener('click', () => {
      site.serviceDetails?.splice(srvIdx, 1);
      this.refreshModalContent();
    });
    block.appendChild(blockHeader);

    // 1. Sign Style Dropdown
    const grpSignStyle = document.createElement('div');
    grpSignStyle.className = 'printpal-form-group';
    grpSignStyle.innerHTML = `
      <label class="printpal-form-label">Sign Style</label>
      <div class="printpal-select-wrapper">
        <select class="printpal-form-select select-sign-style">
          <option value="" disabled ${!srv.signStyle ? 'selected' : ''}></option>
          <option value="ACP Glow Sign" ${srv.signStyle === 'ACP Glow Sign' ? 'selected' : ''}>ACP Glow Sign</option>
          <option value="Acrylic 3D LED Letters" ${srv.signStyle === 'Acrylic 3D LED Letters' ? 'selected' : ''}>Acrylic 3D LED Letters</option>
          <option value="Pylon Signage" ${srv.signStyle === 'Pylon Signage' ? 'selected' : ''}>Pylon Signage</option>
          <option value="Metal Laser Cut Letters" ${srv.signStyle === 'Metal Laser Cut Letters' ? 'selected' : ''}>Metal Laser Cut Letters</option>
          <option value="Flex Lightbox" ${srv.signStyle === 'Flex Lightbox' ? 'selected' : ''}>Flex Lightbox</option>
          <option value="Directional & Wayfinding" ${srv.signStyle === 'Directional & Wayfinding' ? 'selected' : ''}>Directional & Wayfinding</option>
          <option value="Safety & Exit Signage" ${srv.signStyle === 'Safety & Exit Signage' ? 'selected' : ''}>Safety & Exit Signage</option>
          <option value="Neon & LED Neon Flex" ${srv.signStyle === 'Neon & LED Neon Flex' ? 'selected' : ''}>Neon & LED Neon Flex</option>
        </select>
        <svg class="printpal-select-chevron" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    const selStyle = grpSignStyle.querySelector('select') as HTMLSelectElement;
    selStyle.addEventListener('change', () => {
      srv.signStyle = selStyle.value;
      if (!site.services.includes(selStyle.value)) {
        site.services.push(selStyle.value);
      }
    });
    block.appendChild(grpSignStyle);

    // 2. Application: 3 Pill Buttons [ Indoor ] [ Outdoor ] [ Coastal ]
    const grpApp = document.createElement('div');
    grpApp.className = 'printpal-form-group';
    grpApp.innerHTML = `
      <label class="printpal-form-label">Application</label>
      <div class="printpal-pill-buttons-row">
        <button type="button" class="printpal-pill-btn ${srv.application === 'Indoor' ? 'active' : ''}" data-app="Indoor">Indoor</button>
        <button type="button" class="printpal-pill-btn ${srv.application === 'Outdoor' ? 'active' : ''}" data-app="Outdoor">Outdoor</button>
        <button type="button" class="printpal-pill-btn ${srv.application === 'Coastal' ? 'active' : ''}" data-app="Coastal">Coastal</button>
      </div>
    `;

    grpApp.querySelectorAll('.printpal-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetApp = btn.getAttribute('data-app') as 'Indoor' | 'Outdoor' | 'Coastal';
        srv.application = targetApp;
        grpApp.querySelectorAll('.printpal-pill-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    block.appendChild(grpApp);

    // 3. Dimensions & Quantity Row: [ W ] X [ H ] [ ft ▾ ] [ Qty ]
    const dimRow = document.createElement('div');
    dimRow.className = 'printpal-dim-qty-row';
    dimRow.innerHTML = `
      <div class="printpal-dim-input-wrapper">
        <input type="number" class="printpal-form-input input-dim-w" placeholder="W" value="${srv.width || ''}" />
      </div>

      <span class="printpal-dim-separator">X</span>

      <div class="printpal-dim-input-wrapper">
        <input type="number" class="printpal-form-input input-dim-h" placeholder="H" value="${srv.height || ''}" />
      </div>

      <div class="printpal-unit-select-wrapper">
        <select class="printpal-form-select select-unit">
          <option value="ft" ${srv.unit === 'ft' ? 'selected' : ''}>ft</option>
          <option value="in" ${srv.unit === 'in' ? 'selected' : ''}>in</option>
          <option value="mm" ${srv.unit === 'mm' ? 'selected' : ''}>mm</option>
          <option value="m" ${srv.unit === 'm' ? 'selected' : ''}>m</option>
        </select>
        <svg class="printpal-select-chevron" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="printpal-qty-box">
        <input type="number" class="printpal-qty-input" min="1" value="${srv.quantity || 1}" />
        <span class="printpal-qty-label">Qty</span>
      </div>
    `;

    const wInp = dimRow.querySelector('.input-dim-w') as HTMLInputElement;
    const hInp = dimRow.querySelector('.input-dim-h') as HTMLInputElement;
    const uInp = dimRow.querySelector('.select-unit') as HTMLSelectElement;
    const qInp = dimRow.querySelector('.printpal-qty-input') as HTMLInputElement;

    wInp.addEventListener('input', () => (srv.width = wInp.value));
    hInp.addEventListener('input', () => (srv.height = hInp.value));
    uInp.addEventListener('change', () => (srv.unit = uInp.value));
    qInp.addEventListener('input', () => (srv.quantity = parseInt(qInp.value, 10) || 1));

    block.appendChild(dimRow);

    // 4. Reference files: Upload Dropzone with Cloud Icon & "Browse" link
    const grpRef = document.createElement('div');
    grpRef.className = 'printpal-form-group';

    const refLabel = document.createElement('label');
    refLabel.className = 'printpal-form-label';
    refLabel.textContent = 'Reference files';
    grpRef.appendChild(refLabel);

    const dropzone = document.createElement('div');
    dropzone.className = 'printpal-upload-dropzone';
    dropzone.innerHTML = `
      <input type="file" multiple accept="image/*,.pdf,.cdr,.ai,.dxf" class="printpal-file-hidden-input" style="display: none;" />
      <div class="printpal-dropzone-content">
        <svg class="printpal-cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
          <polyline points="12 12 12 16"/>
          <polyline points="9 13 12 10 15 13"/>
        </svg>
        <div class="printpal-dropzone-text">
          Drop logo, sketch or reference images here or <span class="printpal-browse-link">Browse</span>
        </div>
      </div>
      <div class="printpal-uploaded-chips"></div>
    `;

    const fileInput = dropzone.querySelector('.printpal-file-hidden-input') as HTMLInputElement;
    const browseLink = dropzone.querySelector('.printpal-browse-link') as HTMLElement;
    const chipsContainer = dropzone.querySelector('.printpal-uploaded-chips') as HTMLElement;

    const renderChips = () => {
      chipsContainer.innerHTML = '';
      if (srv.referenceFiles && srv.referenceFiles.length > 0) {
        srv.referenceFiles.forEach((fileName, fIdx) => {
          const chip = document.createElement('div');
          chip.className = 'printpal-file-chip';
          chip.innerHTML = `
            <span>📄 ${fileName}</span>
            <button type="button" class="chip-del-btn">✕</button>
          `;
          chip.querySelector('.chip-del-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            srv.referenceFiles?.splice(fIdx, 1);
            renderChips();
          });
          chipsContainer.appendChild(chip);
        });
      }
    };

    renderChips();

    browseLink.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        Array.from(fileInput.files).forEach((f) => {
          if (!srv.referenceFiles) srv.referenceFiles = [];
          srv.referenceFiles.push(f.name);
        });
        renderChips();
      }
    });

    // Drag & drop handlers
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer?.files) {
        Array.from(e.dataTransfer.files).forEach((f) => {
          if (!srv.referenceFiles) srv.referenceFiles = [];
          srv.referenceFiles.push(f.name);
        });
        renderChips();
      }
    });

    grpRef.appendChild(dropzone);
    block.appendChild(grpRef);

    // 5. Notes Textarea
    const grpNotes = document.createElement('div');
    grpNotes.className = 'printpal-form-group';
    grpNotes.innerHTML = `
      <label class="printpal-form-label">Notes</label>
      <textarea class="printpal-form-textarea" placeholder="">${srv.notes || ''}</textarea>
    `;
    const noteArea = grpNotes.querySelector('textarea') as HTMLTextAreaElement;
    noteArea.addEventListener('input', () => (srv.notes = noteArea.value));
    block.appendChild(grpNotes);

    return block;
  }

  // ── 6. Handle Save New Customer ──
  private handleSaveCustomer() {
    const bizInput = document.getElementById('input-biz-name') as HTMLInputElement;
    const nameInput = document.getElementById('input-contact-name') as HTMLInputElement;
    const phoneInput = document.getElementById('input-contact-phone') as HTMLInputElement;
    const waInput = document.getElementById('input-whatsapp-same') as HTMLInputElement;
    const emailInput = document.getElementById('input-email') as HTMLInputElement;
    const followInput = document.getElementById('input-followup-date') as HTMLInputElement;

    const contactName = nameInput?.value.trim() || bizInput?.value.trim() || 'John Doe';
    const phone = phoneInput?.value.trim() || '+91 9876543210';
    const email = emailInput?.value.trim() || 'john@gmail.com';

    // Format address from primary site
    const primarySite = this.formSites[0];
    let fullAddr = 'No.1/16 abc street, DEF nagar, Chennai - 600051';
    if (primarySite) {
      const parts = [
        primarySite.addressLine1,
        primarySite.addressLine2,
        primarySite.city,
        primarySite.pincode ? `- ${primarySite.pincode}` : '',
      ].filter(Boolean);
      if (parts.length > 0) {
        fullAddr = parts.join(', ');
      }
    }

    if (this.editingCustomerId) {
      // Update existing customer
      const targetIdx = this.customers.findIndex((c) => c.id === this.editingCustomerId);
      if (targetIdx !== -1) {
        this.customers[targetIdx] = {
          ...this.customers[targetIdx],
          businessName: bizInput?.value.trim() || contactName,
          name: contactName,
          phone,
          isWhatsAppSame: waInput?.checked ?? true,
          email,
          followUpDate: followInput?.value || '',
          address: fullAddr,
          sites: JSON.parse(JSON.stringify(this.formSites)),
        };
      }
      this.showToast(`Customer "${contactName}" updated successfully!`);
    } else {
      // Create new customer record
      const newCustomer: CustomerRecord = {
        id: `cust-${Date.now()}`,
        businessName: bizInput?.value.trim() || contactName,
        name: contactName,
        phone,
        isWhatsAppSame: waInput?.checked ?? true,
        email,
        followUpDate: followInput?.value || '',
        address: fullAddr,
        createdAt: new Date().toISOString(),
        sites: JSON.parse(JSON.stringify(this.formSites)),
      };
      this.customers.unshift(newCustomer);
      this.showToast(`Customer "${contactName}" created with ${this.formSites.length} site(s)!`);
    }

    this.saveCustomers();
    this.closeNewCustomerModal();
    setTimeout(() => {
      this.render();
    }, 360);
  }

  // ── Modal Input Sync & Fast In-Place Refresh ──
  private syncModalInputs() {
    const bizInput = document.getElementById('input-biz-name') as HTMLInputElement | null;
    const contactInput = document.getElementById('input-contact-name') as HTMLInputElement | null;
    const phoneInput = document.getElementById('input-contact-phone') as HTMLInputElement | null;
    const waInput = document.getElementById('input-whatsapp-same') as HTMLInputElement | null;
    const emailInput = document.getElementById('input-email') as HTMLInputElement | null;
    const followInput = document.getElementById('input-followup-date') as HTMLInputElement | null;

    if (bizInput) this.formBasicDetails.businessName = bizInput.value;
    if (contactInput) this.formBasicDetails.primaryContactName = contactInput.value;
    if (phoneInput) this.formBasicDetails.primaryContactNumber = phoneInput.value;
    if (waInput) this.formBasicDetails.isWhatsAppSame = waInput.checked;
    if (emailInput) this.formBasicDetails.email = emailInput.value;
    if (followInput) this.formBasicDetails.followUpDate = followInput.value;

    const billingName = document.querySelector('.input-billing-name') as HTMLInputElement | null;
    const billingGst = document.querySelector('.input-billing-gst') as HTMLInputElement | null;
    const billingAddr = document.querySelector('.input-billing-addr') as HTMLInputElement | null;
    const billingCity = document.querySelector('.input-billing-city') as HTMLInputElement | null;
    const billingState = document.querySelector('.input-billing-state') as HTMLInputElement | null;
    const billingPin = document.querySelector('.input-billing-pincode') as HTMLInputElement | null;

    if (billingName) this.billingDetails.billingName = billingName.value;
    if (billingGst) this.billingDetails.gstin = billingGst.value;
    if (billingAddr) this.billingDetails.billingAddress = billingAddr.value;
    if (billingCity) this.billingDetails.city = billingCity.value;
    if (billingState) this.billingDetails.state = billingState.value;
    if (billingPin) this.billingDetails.pincode = billingPin.value;
  }

  private refreshModalContent() {
    this.syncModalInputs();
    const overlay = document.getElementById('new-customer-modal-overlay');
    if (overlay) {
      const newOverlay = this.buildNewCustomerModal();
      newOverlay.classList.add('open');
      overlay.replaceWith(newOverlay);
    }
  }

  // ── Open & Close Modal with Fluid Bottom Slide-Up Transition ──
  public openNewCustomerModal(reset = true) {
    if (reset) {
      this.editingCustomerId = null;
      this.formBasicDetails = {
        businessName: '',
        primaryContactName: '',
        primaryContactNumber: '',
        isWhatsAppSame: true,
        email: '',
        followUpDate: '',
      };
      this.initDefaultSites();
      this.activeRightTab = 'services';
    }
    this.isModalOpen = true;

    let overlay = document.getElementById('new-customer-modal-overlay');
    if (overlay) {
      const newOverlay = this.buildNewCustomerModal();
      // Ensure starting position is closed so the browser executes the full slide-up transition
      newOverlay.classList.remove('open');
      overlay.replaceWith(newOverlay);
      overlay = newOverlay;
    }

    if (overlay) {
      // Force layout reflow so translateY(100%) is registered by browser engine
      void overlay.offsetHeight;
      requestAnimationFrame(() => {
        overlay?.classList.add('open');
      });
    }
  }

  public closeNewCustomerModal() {
    const overlay = document.getElementById('new-customer-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
    this.isModalOpen = false;
  }

  // ── 7. Multi-Sites Detail Modal (Desktop - 2) ──
  private buildMultiSitesModal(cust: CustomerRecord): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'printpal-modal-backdrop';
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        this.selectedCustomerForSites = null;
        this.render();
      }
    };

    const card = document.createElement('div');
    card.className = 'printpal-modal-card';

    const head = document.createElement('div');
    head.className = 'printpal-modal-head';
    head.innerHTML = `
      <div>
        <h3 class="printpal-modal-title">${cust.name} — Registered Physical Sites</h3>
        <span style="font-size: 13px; color: var(--printpal-muted);">Total ${cust.sites.length} locations configured</span>
      </div>
      <button class="printpal-modal-close-btn">✕</button>
    `;
    head.querySelector('.printpal-modal-close-btn')?.addEventListener('click', () => {
      this.selectedCustomerForSites = null;
      this.render();
    });

    const body = document.createElement('div');
    body.className = 'printpal-modal-body';

    cust.sites.forEach((site, i) => {
      const item = document.createElement('div');
      item.className = 'printpal-site-list-item';
      item.innerHTML = `
        <div class="printpal-site-list-item-title">${site.siteName || `Site ${i + 1}`}</div>
        <div class="printpal-site-list-item-address">📍 ${site.address}</div>
        <div class="printpal-site-list-item-tags">
          ${(site.services || []).map((s) => `<span class="printpal-tag">${s}</span>`).join('')}
          <span class="printpal-tag" style="background: #e0f2fe; color: #0369a1;">Mounting: ${site.mountingHeightAglFt || 10}ft AGL</span>
          <span class="printpal-tag" style="background: #fef3c7; color: #92400e;">Substrate: ${site.wallSubstrate || 'ACP'}</span>
        </div>
      `;
      body.appendChild(item);
    });

    card.appendChild(head);
    card.appendChild(body);
    backdrop.appendChild(card);
    return backdrop;
  }

  private showToast(msg: string) {
    const existing = document.getElementById('printpal-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'printpal-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(32, 36, 40, 0.95);
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      pointer-events: none;
      animation: printpal-modal-in 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.12);
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }
}
