import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Firebase dependencies
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate user logged in
    callback({ uid: 'test-uid', email: 'vannesh129@gmail.com' });
    return () => {};
  }),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      companyProfile: { nama: 'JURAGAN RONGSOK', alamat: 'Jl. Pengepul No. 1', telepon: '081234567890' },
      fixedCosts: [],
      variableCosts: [],
      inventory: [],
      sellers: [],
      transactions: [],
      sales: [],
      debtors: [],
      wallet: {
        balance: 8500000,
        history: [
          { id: 1, date: '2026-05-29', type: 'IN', amount: 7800000, desc: 'Penjualan Kardus 3000kg (Cair)', status: 'Successful' },
          { id: 2, date: '2026-05-29', type: 'OUT', amount: 7980000, desc: 'Beli rongsok dari ipul', status: 'Pending' },
          { id: 3, date: '2026-04-19', type: 'OUT', amount: 1320000, desc: 'Beli rongsok dari ervan', status: 'Failed' },
          { id: 4, date: '2026-04-19', type: 'IN', amount: 10000000, desc: 'saldo awal', status: 'Failed' },
          { id: 5, date: '2026-04-19', type: 'IN', amount: 7800000, desc: 'saldo awal', status: 'Pending' }
        ]
      },
      masterCommodities: ['Tembaga', 'Kuningan', 'Alumunium', 'Besi', 'Plastik', 'Kardus', 'Lainnya'],
      globalPrices: {},
      settings: { geminiApiKey: 'test-key' }
    })
  })),
}));

describe('Juragan Rongsok Frontend Redesign Tests', () => {
  const navigateToDompetku = async () => {
    const dompetBtn = await screen.findByRole('button', { name: /Dompetku \(Kas\)/i });
    fireEvent.click(dompetBtn);
  };

  it('renders Sidebar and header greeting correctly', async () => {
    render(<App />);
    await navigateToDompetku();
    
    // Check if system loads dashboard and displays welcome message
    const greeting = await screen.findByText(/Good morning,/i);
    expect(greeting).toBeInTheDocument();
    
    const adminText = screen.getByText(/Admin!/i);
    expect(adminText).toBeInTheDocument();
  });

  it('renders Active Wallet Balance with new style and correct amount', async () => {
    render(<App />);
    await navigateToDompetku();
    
    // Check if the balance section exists
    const balanceHeader = await screen.findByText(/SALDO KAS AKTIF/i);
    expect(balanceHeader).toBeInTheDocument();
    
    // Format Rp 8.500.000 is used
    const balanceAmounts = screen.getAllByText(/Rp\s*8\.500\.000/);
    expect(balanceAmounts.length).toBeGreaterThan(0);
  });

  it('renders Quick Insights circles', async () => {
    render(<App />);
    await navigateToDompetku();
    
    // Verify Quick Insights Donut Chart labels and values
    const totalModalLabel = await screen.findByText('Total Modal');
    expect(totalModalLabel).toBeInTheDocument();

    const legendUangKas = screen.getByText('Uang Kas');
    expect(legendUangKas).toBeInTheDocument();

    const legendPembelian = screen.getByText('Pembelian');
    expect(legendPembelian).toBeInTheDocument();

    const legendPengeluaran = screen.getByText('Pengeluaran');
    expect(legendPengeluaran).toBeInTheDocument();

    const legendHutang = screen.getByText('Hutang');
    expect(legendHutang).toBeInTheDocument();
    
    // Check percentages based on mock calculations
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);

    // Verify new Dashboard Insights Cards
    expect(screen.getByText('Laba Bersih Usaha')).toBeInTheDocument();
    expect(screen.getByText('Total Piutang Kasbon')).toBeInTheDocument();
    expect(screen.getByText('Tunggakan Mitra Terbesar')).toBeInTheDocument();
  });

  it('renders Riwayat Arus Kas table with correct columns and status pills', async () => {
    render(<App />);
    await navigateToDompetku();
    
    // Table headers
    const statusHeader = await screen.findByText('STATUS');
    expect(statusHeader).toBeInTheDocument();
    
    // Table row content checks
    expect(screen.getByText('Penjualan Kardus 3000kg (Cair)')).toBeInTheDocument();
    expect(screen.getByText('Beli rongsok dari ipul')).toBeInTheDocument();
    
    // Check status pill rendering
    const successfulPills = screen.getAllByText('Successful');
    expect(successfulPills.length).toBeGreaterThan(0);
    
    const pendingPills = screen.getAllByText('Pending');
    expect(pendingPills.length).toBeGreaterThan(0);
    
    const failedPills = screen.getAllByText('Failed');
    expect(failedPills.length).toBeGreaterThan(0);
  });

  it('toggles dark mode theme on click', async () => {
    render(<App />);
    await navigateToDompetku();
    
    const toggleThemeBtns = await screen.findAllByTitle('Dark Mode');
    expect(toggleThemeBtns.length).toBeGreaterThan(0);
    
    // Switch to dark mode
    fireEvent.click(toggleThemeBtns[0]);
    expect(screen.getAllByTitle('Light Mode').length).toBeGreaterThan(0);
    
    // Switch back to light mode
    const toggleLightBtns = screen.getAllByTitle('Light Mode');
    fireEvent.click(toggleLightBtns[0]);
    expect(screen.getAllByTitle('Dark Mode').length).toBeGreaterThan(0);
  });

  it('toggles sidebar open and close correctly', async () => {
    render(<App />);
    await navigateToDompetku();
    
    // Initially open
    expect(screen.getByText('Dompetku (Kas)')).toBeInTheDocument();
    
    // Click close menu (X) button
    const closeBtns = await screen.findAllByTitle('Close Menu');
    expect(closeBtns.length).toBeGreaterThan(0);
    fireEvent.click(closeBtns[0]);
    
    // Open Menu button (hamburger menu) should appear
    const openMenuBtn = await screen.findByTitle('Open Menu');
    expect(openMenuBtn).toBeInTheDocument();
    
    // Click open menu
    fireEvent.click(openMenuBtn);
    
    // Sidebar should be open again
    expect(screen.getByText('Dompetku (Kas)')).toBeInTheDocument();
  });
});
