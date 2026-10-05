import { PaymentTransaction, SyscohadaInvoice } from '../types';
import { db } from './db';

export interface MoMoPaymentRequest {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  amount: number;
  paymentType: 'deposit' | 'full';
  provider: 'mtn_momo' | 'orange_money';
  doctorName: string;
  clinicName: string;
}

export interface MoMoPaymentResponse {
  success: boolean;
  transactionId: string;
  providerReference: string;
  message: string;
  commissionFCFA: number;
  timestamp: string;
}

export const paymentService = {
  detectProvider(phone: string): 'mtn_momo' | 'orange_money' {
    const clean = phone.replace(/[^0-9]/g, '');
    // Cameroon prefixes: MTN: 67, 650-654, 680-683. Orange: 69, 655-659.
    if (clean.includes('67') || clean.includes('68') || clean.includes('650') || clean.includes('651') || clean.includes('652') || clean.includes('653') || clean.includes('654')) {
      return 'mtn_momo';
    }
    return 'orange_money';
  },

  async processPayment(
    req: MoMoPaymentRequest,
    simulateOutcome: 'success' | 'insufficient_funds' | 'timeout' = 'success'
  ): Promise<MoMoPaymentResponse> {
    // Artificial latency mimicking MTN/Orange USSD network push in Douala
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const providerRef =
      req.provider === 'mtn_momo'
        ? `MTN-CM-${Math.floor(1000000 + Math.random() * 9000000)}`
        : `OM-DLA-${Math.floor(10000 + Math.random() * 90000)}`;

    const commission = Math.round(req.amount * 0.01); // 1% commission

    if (simulateOutcome === 'insufficient_funds') {
      const failedTx: PaymentTransaction = {
        id: 'tx_' + Date.now(),
        appointmentId: req.appointmentId,
        patientName: req.patientName,
        patientPhone: req.patientPhone,
        amount: req.amount,
        paymentType: req.paymentType,
        provider: req.provider,
        providerTxId: providerRef,
        status: 'failed',
        syscohadaAccount: req.provider === 'mtn_momo' ? '5211' : '5212',
        timestamp: new Date().toISOString(),
        feeCommission: 0,
      };
      return {
        success: false,
        transactionId: failedTx.id,
        providerReference: providerRef,
        message: 'Solde insuffisant sur votre compte Mobile Money. Veuillez recharger votre portefeuille ou payer au secrétariat.',
        commissionFCFA: 0,
        timestamp: new Date().toISOString(),
      };
    }

    if (simulateOutcome === 'timeout') {
      return {
        success: false,
        transactionId: 'tx_failed_' + Date.now(),
        providerReference: providerRef,
        message: 'Délai d’attente USSD expiré (30s sans validation du code PIN). Aucune somme n’a été débitée.',
        commissionFCFA: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const tx: PaymentTransaction = {
      id: 'tx_' + Date.now(),
      appointmentId: req.appointmentId,
      patientName: req.patientName,
      patientPhone: req.patientPhone,
      amount: req.amount,
      paymentType: req.paymentType,
      provider: req.provider,
      providerTxId: providerRef,
      status: 'success',
      syscohadaAccount: req.provider === 'mtn_momo' ? '5211' : '5212',
      timestamp: new Date().toISOString(),
      feeCommission: commission,
    };

    // Save transaction to DB
    const transactions: PaymentTransaction[] = db.getStored('transactions', []);
    transactions.unshift(tx);
    db.setStored('transactions', transactions);

    // Create or update SYSCOHADA invoice
    const newInvoice: SyscohadaInvoice = {
      id: `FACT-DLA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: req.appointmentId,
      patientName: req.patientName,
      date: new Date().toISOString().split('T')[0],
      consultationFee: req.amount,
      additionalActsFee: 0,
      totalTTC: req.amount,
      amountPaid: req.amount,
      balanceDue: 0,
      paymentMethod: req.provider === 'mtn_momo' ? 'MTN MoMo (*126#)' : 'Orange Money (*150#)',
      accountCredit: '7061 (Prestations de soins)',
      accountDebit: req.provider === 'mtn_momo' ? '5211 (Trésorerie MoMo)' : '5212 (Trésorerie Orange Money)',
      status: 'paid',
    };
    db.saveInvoice(newInvoice);

    // Audit log
    db.addAuditLog(
      'Passerelle Mobile Money Cameroun',
      `Encaissement ${req.provider === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}`,
      `Paiement de ${req.amount.toLocaleString()} FCFA reçu (Réf: ${providerRef}) pour ${req.patientName}. Rapprochement SYSCOHADA 521.`
    );

    return {
      success: true,
      transactionId: tx.id,
      providerReference: providerRef,
      message: `Paiement de ${req.amount.toLocaleString()} FCFA validé avec succès par ${req.provider === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}.`,
      commissionFCFA: commission,
      timestamp: new Date().toISOString(),
    };
  },

  async refundPayment(transactionId: string, reason: string): Promise<boolean> {
    const transactions: PaymentTransaction[] = db.getStored('transactions', []);
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return false;

    tx.status = 'refunded';
    db.setStored('transactions', transactions);

    db.addAuditLog(
      'Secrétariat Caisse',
      'Remboursement Mobile Money',
      `Remboursement de ${tx.amount.toLocaleString()} FCFA émis vers ${tx.patientPhone} (${tx.provider}). Motif: ${reason}`
    );
    return true;
  },
};
