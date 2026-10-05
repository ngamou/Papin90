import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    patientWhatsApp: string;
    patientPwa: string;
    practitionerAgenda: string;
    waitingRoomKanban: string;
    cashDesk: string;
    medicalStock: string;
    analytics: string;
    compliance: string;
  };
  actions: {
    bookAppointment: string;
    payDeposit: string;
    payFull: string;
    consultNow: string;
    callNextPatient: string;
    generatePrescription: string;
    downloadInvoice: string;
    sendWhatsApp: string;
    syncData: string;
    offlineMode: string;
    onlineMode: string;
  };
  triage: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    redDesc: string;
    orangeDesc: string;
    yellowDesc: string;
    greenDesc: string;
  };
  messages: {
    bookingConfirmedTitle: string;
    bookingConfirmedBody: string;
    reminder24h: string;
    reminder2h: string;
    queueTurnNotice: string;
    preConsultationTips: string;
    momoSuccess: string;
    momoFailure: string;
    dataConsentNotice: string;
  };
  localPhrases: {
    welcomeGreeting: string;
    confirmationAudioText: string;
    emergencyCaution: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  fr: {
    appName: 'DoualaSanté',
    tagline: 'Plateforme médicale offline-first pour cliniques et spécialistes à Douala',
    nav: {
      patientWhatsApp: 'WhatsApp Flows',
      patientPwa: 'Portail Patient',
      practitionerAgenda: 'Agenda Médecin',
      waitingRoomKanban: 'Salle d’Attente & Tri',
      cashDesk: 'Caisse & SYSCOHADA',
      medicalStock: 'Stock Consommables',
      analytics: 'Analytique & ROI',
      compliance: 'Loi 2024/017 & Sécurité',
    },
    actions: {
      bookAppointment: 'Prendre rendez-vous',
      payDeposit: 'Payer acompte (2 000 FCFA)',
      payFull: 'Régler la totalité',
      consultNow: 'Lancer consultation',
      callNextPatient: 'Appeler patient suivant',
      generatePrescription: 'Générer ordonnance sécurisée',
      downloadInvoice: 'Télécharger facture OHADA',
      sendWhatsApp: 'Envoyer sur WhatsApp',
      syncData: 'Synchroniser différentiel',
      offlineMode: 'Mode Hors-ligne activé',
      onlineMode: 'Connecté au serveur CEMAC',
    },
    triage: {
      red: 'Urgence Vitale (Rouge)',
      orange: 'Très Urgent (Orange)',
      yellow: 'Urgent (Jaune)',
      green: 'Standard (Vert)',
      redDesc: 'Prise en charge immédiate sans attente',
      orangeDesc: 'Délai maximal < 15 minutes',
      yellowDesc: 'Prise en charge < 60 minutes',
      greenDesc: 'Consultation programmée de routine',
    },
    messages: {
      bookingConfirmedTitle: 'Rendez-vous confirmé avec succès',
      bookingConfirmedBody: 'Votre créneau est réservé. L’acompte de 2 000 FCFA a été validé via Mobile Money.',
      reminder24h: 'Rappel DoualaSanté : Votre consultation est prévue demain à {time} avec {doctor} à {clinic}.',
      reminder2h: 'Rappel urgent : Votre rendez-vous est dans 2h. Temps de trajet estimé à Douala : 35 min selon le trafic.',
      queueTurnNotice: 'Votre tour arrive ! Plus que 1 patient avant vous. Présentez-vous à l’accueil.',
      preConsultationTips: 'Instructions pré-consultation : Venez à jeun si bilan biologique prévu. Apportez votre carnet de santé et ordonnances antérieures.',
      momoSuccess: 'Paiement MTN MoMo / Orange Money approuvé.',
      momoFailure: 'Transaction annulée ou solde insuffisant. Vous pouvez réessayer ou payer à l’accueil.',
      dataConsentNotice: 'Conformité Loi n° 2024/017 : Vos données médicales sont chiffrées en AES-256 et restent hébergées au Cameroun.',
    },
    localPhrases: {
      welcomeGreeting: 'Bienvenue sur DoualaSanté. Prenez soin de votre santé sans file d’attente inutile.',
      confirmationAudioText: 'Votre rendez-vous a bien été enregistré. Merci de faire confiance à notre équipe soignante.',
      emergencyCaution: 'En cas de détresse respiratoire ou douleur thoracique aiguë, présentez-vous directement aux urgences.',
    },
  },

  en: {
    appName: 'DoualaSanté',
    tagline: 'Offline-first medical scheduling platform for clinics & specialists in Douala',
    nav: {
      patientWhatsApp: 'WhatsApp Flows',
      patientPwa: 'Patient Portal',
      practitionerAgenda: 'Doctor Schedule',
      waitingRoomKanban: 'Waiting Room & Triage',
      cashDesk: 'Cash Desk & OHADA',
      medicalStock: 'Medical Consumables',
      analytics: 'Analytics & ROI',
      compliance: 'Law 2024/017 & Security',
    },
    actions: {
      bookAppointment: 'Book Appointment',
      payDeposit: 'Pay Deposit (2,000 FCFA)',
      payFull: 'Pay Full Consultation',
      consultNow: 'Start Consultation',
      callNextPatient: 'Call Next Patient',
      generatePrescription: 'Generate Prescription',
      downloadInvoice: 'Download OHADA Invoice',
      sendWhatsApp: 'Send via WhatsApp',
      syncData: 'Differential Sync',
      offlineMode: 'Offline Mode Active',
      onlineMode: 'Connected to CEMAC Cloud',
    },
    triage: {
      red: 'Vital Emergency (Red)',
      orange: 'High Urgency (Orange)',
      yellow: 'Urgent (Yellow)',
      green: 'Routine (Green)',
      redDesc: 'Immediate doctor intervention required',
      orangeDesc: 'Max wait time < 15 minutes',
      yellowDesc: 'Care provided < 60 minutes',
      greenDesc: 'Routine scheduled visit',
    },
    messages: {
      bookingConfirmedTitle: 'Appointment Confirmed',
      bookingConfirmedBody: 'Your slot is secured. The 2,000 FCFA deposit has been confirmed via Mobile Money.',
      reminder24h: 'DoualaSanté Reminder: Your appointment is tomorrow at {time} with {doctor} at {clinic}.',
      reminder2h: 'Reminder: Your visit is in 2 hours. Estimated Douala traffic transit time: 35 minutes.',
      queueTurnNotice: 'Your turn is up! Only 1 patient ahead of you. Please step into the consultation wing.',
      preConsultationTips: 'Pre-consultation advice: Fast if blood tests are planned. Bring previous records.',
      momoSuccess: 'MTN MoMo / Orange Money payment verified successfully.',
      momoFailure: 'Payment declined or timeout. You can retry or settle at the clinic reception.',
      dataConsentNotice: 'Cameroon Law No. 2024/017: Health data encrypted with AES-256 and hosted locally.',
    },
    localPhrases: {
      welcomeGreeting: 'Welcome to DoualaSanté. Efficient clinic care without unnecessary waiting.',
      confirmationAudioText: 'Your appointment is registered. Thank you for trusting our medical team.',
      emergencyCaution: 'For acute chest pain or respiratory distress, go directly to emergency intake.',
    },
  },

  douala: {
    appName: 'DoualaSanté',
    tagline: 'Mungete ma bolani bwa dokita o mboa Ndola (Douala)',
    nav: {
      patientWhatsApp: 'WhatsApp Flows (Douala)',
      patientPwa: 'Mondo ma Mukédi',
      practitionerAgenda: 'Tém na Dokita',
      waitingRoomKanban: 'Ndabo a Jengi (Salle)',
      cashDesk: 'Mbando na SYSCOHADA',
      medicalStock: 'Bwele na Byemba',
      analytics: 'Mabondo ma Bolani',
      compliance: 'Médi ma 2024/017',
    },
    actions: {
      bookAppointment: 'Bola téngisan na dokita',
      payDeposit: 'Kapa acompte (2 000 FCFA)',
      payFull: 'Longe mondo mwese',
      consultNow: 'Botea dokita son',
      callNextPatient: 'Béle muto nu mpe',
      generatePrescription: 'Tila kalati a bwele',
      downloadInvoice: 'Noŋ kalati a mbando',
      sendWhatsApp: 'Loma o WhatsApp',
      syncData: 'Sasana byongo byese',
      offlineMode: 'Wende a kango (Offline)',
      onlineMode: 'Wende a koki (Online)',
    },
    triage: {
      red: 'Njele a mudinga (Red - Bwa bwindi)',
      orange: 'Njele a mususu (Orange)',
      yellow: 'Son a mbembe (Yellow)',
      green: 'Mondo ma sombo (Green)',
      redDesc: 'O bangi dokita tatan tatan',
      orangeDesc: 'Njele i s’eleki minuti 15',
      yellowDesc: 'Bolani o miniti 60',
      greenDesc: 'Mondo ma longe ma loba',
    },
    messages: {
      bookingConfirmedTitle: 'Tém yongo i longedi bwam (Confirmé)',
      bookingConfirmedBody: 'Tém yongo na dokita i longedi. Kapa a 2 000 FCFA MoMo i pomedi.',
      reminder24h: 'Mungete ma DoualaSanté : Dokita yongo {doctor} a matenga kiele o {time} o {clinic}.',
      reminder2h: 'Dokita a m’ende o minuti 120. Botea dango o Ndola.',
      queueTurnNotice: 'Tatan mutu moko paba a matanga oboso bwongo. Japa o ndabo!',
      preConsultationTips: 'Médi ma botea : O sadi da diwindi kiele woki dokita a puli maye. Noŋ kalati yongo.',
      momoSuccess: 'Mbando MTN MoMo / Orange Money i saledini bwam.',
      momoFailure: 'Mbando e siki. We neni o kapa o ndabo a jengi.',
      dataConsentNotice: 'Médi ma Cameroun n° 2024/017 : Byango byoñ byese bi tatami bwam o Ndola.',
    },
    localPhrases: {
      welcomeGreeting: 'Mulema mwa bwam o DoualaSanté. Bolani bwa dokita senga mpungu.',
      confirmationAudioText: 'Na tondi na o lome tém yongo. Dokita a mande o jengi bwam.',
      emergencyCaution: 'Bwindi bo boli na mulema mu boli bobe, kwedi son o urgences.',
    },
  },

  ewondo: {
    appName: 'DoualaSanté',
    tagline: 'Abui mfi ya minkuk ya mendokita e Douala',
    nav: {
      patientWhatsApp: 'WhatsApp Flows (Ewondo)',
      patientPwa: 'Mfi ya Mbia',
      practitionerAgenda: 'Ngong Dokita',
      waitingRoomKanban: 'Aba ya Nzinga',
      cashDesk: 'Moní ya Mfi',
      medicalStock: 'Biêm ya Mendokita',
      analytics: 'Ntulug ya Mam',
      compliance: 'Mbëmbë Melë (2024/017)',
    },
    actions: {
      bookAppointment: 'Kobo na dokita',
      payDeposit: 'Yahe acompte (2 000 FCFA)',
      payFull: 'Yahe moní mesë',
      consultNow: 'Tebé na dokita',
      callNextPatient: 'Lóndé mbia ya mfe',
      generatePrescription: 'Tili kalara ya biêm',
      downloadInvoice: 'Nong kalara ya moní',
      sendWhatsApp: 'Lóm e WhatsApp',
      syncData: 'Vus mam mesë',
      offlineMode: 'Ntut zia (Offline)',
      onlineMode: 'Mbëmbë élan (Online)',
    },
    triage: {
      red: 'Nkol awu (Red - Ékôan)',
      orange: 'Nkol anen (Orange)',
      yellow: 'Nkol etam (Yellow)',
      green: 'Mbia ya foé (Green)',
      redDesc: 'Dokita a tele valë valë',
      orangeDesc: 'Nzinga < minuti 15',
      yellowDesc: 'Mboan < minuti 60',
      greenDesc: 'Nyenan ya tsini',
    },
    messages: {
      bookingConfirmedTitle: 'Dokita a yem éyé doè (Confirmé)',
      bookingConfirmedBody: 'Ngong doè e tebega. 2 000 FCFA ya MoMo e keban ne mvoé.',
      reminder24h: 'Melë DoualaSanté : O ne na dokita {doctor} kidi e {time} e {clinic}.',
      reminder2h: 'Dokita a koban e awolo 2. Tebé tatan o zen ya Douala.',
      queueTurnNotice: 'Éyé doè e suí ! Mbia mbori ve a ne asu doè. Za e nda.',
      preConsultationTips: 'Mboan asu : Të di zôm kidi nge b’aye nong meki. Za na kalara ya mendokita.',
      momoSuccess: 'Moní MTN MoMo / Orange Money e keban ne mvoé.',
      momoFailure: 'Moní o tebe. We ne yahe valë e aba ya nzinga.',
      dataConsentNotice: 'Melë ya Cameroun n° 2024/017 : Mam moè mesë me baaba chiffré e Kamerun.',
    },
    localPhrases: {
      welcomeGreeting: 'Mbëmbë kiliba e DoualaSanté. Mendokita ya mvoé senga mintag.',
      confirmationAudioText: 'Abui ngan asu éyé doè. Dokita a yene wa ne mvoé.',
      emergencyCaution: 'Nge nlem o ne mintag, kë valë valë e aba ya urgences.',
    },
  },

  bassa: {
    appName: 'DoualaSanté',
    tagline: 'Mbom i dokta ni mapubi ma mbehe i Douala',
    nav: {
      patientWhatsApp: 'WhatsApp Flows (Bassa)',
      patientPwa: 'Liñan li Mut',
      practitionerAgenda: 'Ngéda Dokta',
      waitingRoomKanban: 'Ndap i Biba',
      cashDesk: 'Mbóñ ni SYSCOHADA',
      medicalStock: 'Gwélha bi Dokta',
      analytics: 'Minjehe mi Bapublic',
      compliance: 'Mbén 2024/017',
    },
    actions: {
      bookAppointment: 'Bat ngéda ni dokta',
      payDeposit: 'Hana acompte (2 000 FCFA)',
      payFull: 'Hana moni momasôna',
      consultNow: 'Bôdôl dokta nano',
      callNextPatient: 'Sebla mut numpe',
      generatePrescription: 'Tila kalat i bílôk',
      downloadInvoice: 'Kôs faktur OHADA',
      sendWhatsApp: 'Om ni WhatsApp',
      syncData: 'Ha bisu byonaha',
      offlineMode: 'Ipôm u ngii (Offline)',
      onlineMode: 'Bi nlama mbuk (Online)',
    },
    triage: {
      red: 'Nkol mbok (Red - Nguii)',
      orange: 'Nkol nkol (Orange)',
      yellow: 'Nkol son (Yellow)',
      green: 'Ngéda mbôgi (Green)',
      redDesc: 'Dokta a lama tehe we nano nano',
      orangeDesc: 'Ngéda i nloba minuti 15',
      yellowDesc: 'Tehe dokta i minuti 60',
      greenDesc: 'Mbom i bikéñi',
    },
    messages: {
      bookingConfirmedTitle: 'Ngéda yoñ i ntiyaga kiki nsoñ (Confirmé)',
      bookingConfirmedBody: 'Ngéda yoñ ni dokta i ntiyaga. Acompte 2 000 FCFA MoMo a nkwesana.',
      reminder24h: 'Maa ma DoualaSanté : Dokta {doctor} a mbem we yegle ni {time} i {clinic}.',
      reminder2h: 'Ngéda yoñ i nloba i ngéda yiba 2. Bôdôl lona o Ndola.',
      queueTurnNotice: 'Ngéda yoñ i nloba ! Mut wada nyet a yé bisu gwoñ. Jôp o ndap.',
      preConsultationTips: 'Liti li bôdôl : U je bañ yegle ngé b’aye hek matjél. Lona kalat yoñ i dokta.',
      momoSuccess: 'Moni MTN MoMo / Orange Money mi ntibil kôli.',
      momoFailure: 'Moni mi ngi kôli. U nla kobla ha ha ndap i biba.',
      dataConsentNotice: 'Mbén Cameroun n° 2024/017 : Bisay bi biñ bi ntiyaga ni AES-256 o Kamerun.',
    },
    localPhrases: {
      welcomeGreeting: 'Lipem linene o DoualaSanté. Hehe dokta ségék njal.',
      confirmationAudioText: 'Me ga yé le ngéda yoñ i ntiyaga. Dokta a yé bebee.',
      emergencyCaution: 'Ngé ñem u mbéna kon, ke nano nano i ndap urgences.',
    },
  },
};

export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const navLang = (navigator.language || '').toLowerCase();
  if (navLang.startsWith('en')) return 'en';
  return 'fr';
}
