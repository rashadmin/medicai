export interface EmergencyCase {
  id: string
  patientName: string
  age: number
  bloodGroup: string
  symptoms: string[]
  medicalHistory: string[]
  severity: "critical" | "medium" | "low"
  aiAnalysis: string
  timestamp: Date
  location: string
}

const mockCaseTemplates = [
  {
    patientName: "John Smith",
    age: 45,
    bloodGroup: "O+",
    symptoms: ["Chest pain", "Shortness of breath", "Dizziness"],
    medicalHistory: ["Hypertension", "Diabetes", "High cholesterol"],
    severity: "critical" as const,
    aiAnalysis: "Suspected acute myocardial infarction (heart attack). Requires immediate intervention. Patient needs urgent ECG, troponin levels, and cardiology assessment.",
    location: "123 Main Street, Downtown",
  },
  {
    patientName: "Sarah Johnson",
    age: 28,
    bloodGroup: "A-",
    symptoms: ["Severe abdominal pain", "Nausea", "Fever"],
    medicalHistory: ["No significant medical history"],
    severity: "medium" as const,
    aiAnalysis: "Suspected appendicitis. Patient presents with classic signs including McBurney's point tenderness. Requires CT scan and surgical consultation. May need appendectomy.",
    location: "456 Oak Avenue, Residential Area",
  },
  {
    patientName: "Michael Chen",
    age: 62,
    bloodGroup: "B+",
    symptoms: ["Sudden severe headache", "Weakness on left side", "Speech difficulty"],
    medicalHistory: ["Atrial fibrillation", "Previous stroke"],
    severity: "critical" as const,
    aiAnalysis: "Suspected acute ischemic stroke. Time-critical intervention required. Patient appears to be within thrombolytic window. Immediate CT/MRI and neurology consult needed.",
    location: "789 Elm Street, Hospital District",
  },
  {
    patientName: "Emma Davis",
    age: 34,
    bloodGroup: "AB+",
    symptoms: ["Severe allergic reaction", "Difficulty breathing", "Swelling of face and throat"],
    medicalHistory: ["Multiple drug allergies", "Asthma"],
    severity: "critical" as const,
    aiAnalysis: "Anaphylactic shock - severe allergic reaction. Immediate epinephrine administration required. Secure airway, provide oxygen support, antihistamines and corticosteroids needed.",
    location: "321 Park Road, Commercial District",
  },
  {
    patientName: "Robert Wilson",
    age: 55,
    bloodGroup: "O-",
    symptoms: ["Deep laceration on forearm", "Bleeding"],
    medicalHistory: ["On anticoagulants"],
    severity: "medium" as const,
    aiAnalysis: "Significant laceration with active bleeding. Possible vascular involvement. Patient on anticoagulation therapy complicates management. Requires suturing and possible vascular surgery consultation.",
    location: "654 Maple Drive, Industrial Area",
  },
  {
    patientName: "Lisa Anderson",
    age: 71,
    bloodGroup: "A+",
    symptoms: ["Difficulty breathing", "Chest discomfort", "Fatigue"],
    medicalHistory: ["COPD", "Heart failure", "Smoking history"],
    severity: "medium" as const,
    aiAnalysis: "Acute exacerbation of COPD or possible acute heart failure. Patient needs oxygen support, spirometry testing, and chest X-ray. Consider bronchodilators and diuretics.",
    location: "987 Birch Lane, Suburbs",
  },
  {
    patientName: "David Martinez",
    age: 41,
    bloodGroup: "B-",
    symptoms: ["Abdominal trauma", "Internal bleeding suspected"],
    medicalHistory: ["Previous spleen removal"],
    severity: "critical" as const,
    aiAnalysis: "Blunt abdominal trauma with signs of internal bleeding. Hemodynamically unstable patient. Immediate trauma surgery required. Blood transfusion and imaging (CT scan) essential.",
    location: "135 Cedar Street, Downtown",
  },
]

export function generateMockCase(): EmergencyCase {
  const template = mockCaseTemplates[Math.floor(Math.random() * mockCaseTemplates.length)]
  return {
    id: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...template,
    timestamp: new Date(),
  }
}

export function playAlertSound(): void {
  // Create an audio context and play a simple alert sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Create a siren-like sound pattern
    oscillator.frequency.value = 800
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Play it 3 times with delays
    setTimeout(() => playAlertSoundRepeat(audioContext, 1), 600)
    setTimeout(() => playAlertSoundRepeat(audioContext, 2), 1200)
  } catch (error) {
    console.log("[v0] Audio context not available, using fallback")
  }
}

function playAlertSoundRepeat(audioContext: AudioContext, iteration: number): void {
  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.log("[v0] Error playing sound iteration", iteration)
  }
}
