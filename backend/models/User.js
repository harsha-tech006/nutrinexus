const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Address Schema
const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

// Health Metrics Schema
const healthMetricsSchema = new mongoose.Schema({
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' },
    recordedAt: { type: Date, default: Date.now }
  },
  height: {
    value: Number,
    unit: { type: String, default: 'cm' },
    recordedAt: { type: Date, default: Date.now }
  },
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    recordedAt: Date
  },
  bloodSugar: {
    fasting: Number,
    postPrandial: Number,
    recordedAt: Date
  },
  heartRate: {
    value: Number,
    recordedAt: Date
  },
  sleepHours: {
    value: Number,
    recordedAt: Date
  },
  bmi: {
    value: Number,
    category: String,
    calculatedAt: Date
  }
});

// Symptoms Tracking Schema
const symptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: Number, min: 1, max: 10 },
  duration: String, // e.g., "2 days", "1 week"
  notes: String,
  recordedAt: { type: Date, default: Date.now }
});

// PCOS Specific Data Schema
const pcosDataSchema = new mongoose.Schema({
  menstrualCycle: {
    length: Number, // in days
    regularity: { type: String, enum: ['regular', 'irregular', 'absent'] },
    lastPeriod: Date,
    nextExpected: Date,
    symptoms: [{
      type: String,
      severity: Number
    }]
  },
  hormoneLevels: {
    lh: { value: Number, unit: { type: String, default: 'mIU/mL' }, date: Date },
    fsh: { value: Number, unit: { type: String, default: 'mIU/mL' }, date: Date },
    testosterone: { value: Number, unit: { type: String, default: 'ng/dL' }, date: Date },
    dheas: { value: Number, unit: { type: String, default: 'μg/dL' }, date: Date },
    prolactin: { value: Number, unit: { type: String, default: 'ng/mL' }, date: Date },
    amh: { value: Number, unit: { type: String, default: 'ng/mL' }, date: Date }
  },
  ultrasoundFindings: {
    ovarianVolume: { left: Number, right: Number, unit: { type: String, default: 'mL' }, date: Date },
    follicleCount: { left: Number, right: Number, date: Date },
    polycysticMorphology: Boolean,
    date: Date
  },
  symptoms: [{
    name: { type: String, enum: [
      'irregular_periods', 'heavy_bleeding', 'acne', 'hair_loss', 
      'excess_hair_growth', 'weight_gain', 'fatigue', 'mood_swings',
      'pelvic_pain', 'infertility'
    ]},
    severity: { type: Number, min: 1, max: 10 },
    onset: Date
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String,
    notes: String
  }],
  riskScore: {
    value: Number,
    level: { type: String, enum: ['low', 'moderate', 'high'] },
    calculatedAt: Date,
    factors: [String]
  },
  diagnosis: {
    confirmed: Boolean,
    date: Date,
    doctor: String,
    hospital: String,
    notes: String
  }
});

// Activity Tracking Schema
const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ['walking', 'running', 'cycling', 'yoga', 'gym', 'other'] },
  duration: Number, // in minutes
  caloriesBurned: Number,
  distance: Number, // in km
  steps: Number,
  intensity: { type: String, enum: ['low', 'moderate', 'high'] },
  date: { type: Date, default: Date.now }
});

// Notification Preferences Schema
const notificationPrefsSchema = new mongoose.Schema({
  medicationReminders: { type: Boolean, default: true },
  appointmentReminders: { type: Boolean, default: true },
  nutritionTips: { type: Boolean, default: true },
  yogaReminders: { type: Boolean, default: false },
  reportAlerts: { type: Boolean, default: true },
  reminderTimes: [String], // e.g., ['08:00', '20:00']
  soundEnabled: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true }
});

// Goals Schema
const goalsSchema = new mongoose.Schema({
  type: { type: String, enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'health_maintenance', 'pcos_management'] },
  targetWeight: Number,
  targetBMI: Number,
  dailyCalories: Number,
  dailyProtein: Number,
  dailySteps: Number,
  weeklyWorkouts: Number,
  weeklyYoga: Number,
  waterIntake: Number,
  sleepHours: Number,
  startDate: Date,
  endDate: Date,
  achieved: { type: Boolean, default: false },
  progress: { type: Number, min: 0, max: 100, default: 0 }
});

// Main User Schema
const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    trim: true,
    minlength: [1, 'First name must be at least 1 character'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    minlength: [1, 'Last name must be at least 1 character'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date) {
        const age = (new Date() - date) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 13 && age <= 120;
      },
      message: 'Age must be between 13 and 120 years'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say', 'Male', 'Female', 'Other']
  },
  
  // Language & Preferences
  language: { 
    type: String, 
    default: 'en', 
    enum: ['en', 'kn'] 
  },
  preferredUnits: {
    weight: { type: String, default: 'kg', enum: ['kg', 'lbs'] },
    height: { type: String, default: 'cm', enum: ['cm', 'ft'] },
    distance: { type: String, default: 'km', enum: ['km', 'miles'] },
    temperature: { type: String, default: 'celsius', enum: ['celsius', 'fahrenheit'] }
  },
  
  // Health Information
  healthConditions: [{
    condition: String,
    diagnosedDate: Date,
    severity: String,
    notes: String,
    active: { type: Boolean, default: true }
  }],
  allergies: [{
    allergen: String,
    reaction: String,
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    prescribedBy: String,
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true }
  }],
  
  // Lifestyle Information
  lifestyle: {
    dietType: { type: String, enum: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'pescatarian'] },
    exerciseFrequency: { type: String, enum: ['daily', '3-4_times_week', '1-2_times_week', 'rarely', 'never'] },
    smokingStatus: { type: String, enum: ['never', 'former', 'current'] },
    alcoholConsumption: { type: String, enum: ['never', 'occasional', 'moderate', 'heavy'] },
    sleepPattern: {
      averageHours: Number,
    sleepQuality: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
    },
    stressLevel: { type: Number, min: 1, max: 10 },
    occupation: String,
    workHoursPerWeek: Number
  },
  
  // Body Measurements
  bodyMeasurements: {
    weight: [healthMetricsSchema],
    height: Number,
    waistCircumference: Number,
    hipCircumference: Number,
    bodyFat: Number,
    muscleMass: Number
  },
  
  // PCOS Specific Data (for female users)
  pcosData: pcosDataSchema,
  
  // Tracking Data
  healthMetrics: [healthMetricsSchema],
  symptoms: [symptomSchema],
  activities: [activitySchema],
  
  // Goals
  goals: [goalsSchema],
  activeGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
  
  // Notification Preferences
  notificationPreferences: notificationPrefsSchema,
  
  // Address
  addresses: [addressSchema],
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
    email: String
  },
  
  // Medical History
  medicalHistory: {
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      notes: String
    }],
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: String,
      medications: [String]
    }],
    familyHistory: [{
      relation: String,
      condition: String,
      notes: String
    }]
  },
  
  // Dietary Preferences
  dietaryPreferences: {
    foodPreferences: [String],
    foodAllergies: [String],
    dislikes: [String],
    mealPreferences: {
      mealsPerDay: Number,
      preferredMealTimes: [String]
    }
  },
  
  // Yoga Preferences
  yogaPreferences: {
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    preferredStyles: [String],
    dailyDuration: Number, // in minutes
    preferredTime: String,
    injuries: [String],
    limitations: [String]
  },
  
  // Subscription & Premium Features
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false }
  },
  
  // App Usage Data
  appUsage: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    appOpens: { type: Number, default: 0 },
    featuresUsed: [{
      feature: String,
      count: Number,
      lastUsed: Date
    }]
  },
  
  // Device Information
  devices: [{
    deviceId: String,
    deviceType: String,
    browser: String,
    os: String,
    lastActive: Date,
    pushToken: String
  }],
  
  // Security
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerified: { type: Boolean, default: false },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'pcosData.riskScore.level': 1 });
userSchema.index({ 'healthConditions.condition': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const ageDifMs = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Virtual for BMI calculation
userSchema.virtual('currentBMI').get(function() {
  const latestWeight = this.bodyMeasurements.weight?.sort((a, b) => 
    b.recordedAt - a.recordedAt
  )[0];
  
  if (!latestWeight?.value || !this.bodyMeasurements.height) return null;
  
  const heightInMeters = this.bodyMeasurements.height / 100;
  const bmi = latestWeight.value / (heightInMeters * heightInMeters);
  
  let category = '';
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';
  
  return { value: bmi.toFixed(1), category };
});

// Virtual for PCOS risk assessment
userSchema.virtual('pcosRiskAssessment').get(function() {
  if (!this.pcosData) return null;
  
  let riskScore = 0;
  const factors = [];
  
  // Check symptoms
  if (this.pcosData.symptoms?.length > 3) {
    riskScore += 20;
    factors.push('Multiple symptoms present');
  }
  
  // Check menstrual cycle
  if (this.pcosData.menstrualCycle?.regularity === 'irregular') {
    riskScore += 25;
    factors.push('Irregular menstrual cycle');
  }
  
  // Check hormone levels
  if (this.pcosData.hormoneLevels) {
    const { lh, fsh, testosterone } = this.pcosData.hormoneLevels;
    if (lh?.value && fsh?.value && (lh.value / fsh.value) > 2) {
      riskScore += 20;
      factors.push('Elevated LH/FSH ratio');
    }
    if (testosterone?.value > 50) {
      riskScore += 15;
      factors.push('Elevated testosterone');
    }
  }
  
  // Check ultrasound
  if (this.pcosData.ultrasoundFindings?.polycysticMorphology) {
    riskScore += 25;
    factors.push('Polycystic ovarian morphology');
  }
  
  let level = 'low';
  if (riskScore > 50) level = 'high';
  else if (riskScore > 25) level = 'moderate';
  
  return { riskScore, level, factors };
});

// Pre-validate middleware to construct full name for backward compatibility
userSchema.pre('validate', function(next) {
  if (!this.name && this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`.trim();
  }
  next();
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Update BMI if weight or height changed
  if (this.isModified('bodyMeasurements.weight') || this.isModified('bodyMeasurements.height')) {
    const bmi = await this.currentBMI;
    if (bmi) {
      this.healthMetrics.push({
        bmi: bmi.value,
        recordedAt: new Date()
      });
    }
  }
  
  // Update PCOS risk score if PCOS data changed
  if (this.isModified('pcosData') && this.gender === 'female') {
    const assessment = this.pcosRiskAssessment;
    if (assessment) {
      this.pcosData.riskScore = {
        value: assessment.riskScore,
        level: assessment.level,
        calculatedAt: new Date(),
        factors: assessment.factors
      };
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate reset password token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Method to update health metrics
userSchema.methods.updateHealthMetrics = async function(metrics) {
  this.healthMetrics.push({
    ...metrics,
    recordedAt: new Date()
  });
  
  // Update current body measurements if weight/height provided
  if (metrics.weight) {
    this.bodyMeasurements.weight.push({
      value: metrics.weight,
      recordedAt: new Date()
    });
  }
  
  await this.save();
  return this;
};

// Method to log symptoms
userSchema.methods.logSymptom = async function(symptom) {
  this.symptoms.push(symptom);
  await this.save();
  return this;
};

// Method to track PCOS symptoms specifically
userSchema.methods.trackPCOSSymptom = async function(symptomName, severity) {
  if (!this.pcosData) {
    this.pcosData = {};
  }
  
  if (!this.pcosData.symptoms) {
    this.pcosData.symptoms = [];
  }
  
  this.pcosData.symptoms.push({
    name: symptomName,
    severity: severity,
    onset: new Date()
  });
  
  await this.save();
  return this;
};

// Method to get weekly health summary
userSchema.methods.getWeeklyHealthSummary = function() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentMetrics = this.healthMetrics.filter(m => m.recordedAt >= oneWeekAgo);
  const recentSymptoms = this.symptoms.filter(s => s.recordedAt >= oneWeekAgo);
  
  return {
    averageWeight: recentMetrics.reduce((sum, m) => sum + (m.weight?.value || 0), 0) / recentMetrics.length,
    averageSleep: recentMetrics.reduce((sum, m) => sum + (m.sleepHours?.value || 0), 0) / recentMetrics.length,
    totalSymptoms: recentSymptoms.length,
    commonSymptoms: this.getCommonSymptoms(recentSymptoms),
    pcosSymptoms: this.pcosData?.symptoms?.filter(s => s.onset >= oneWeekAgo) || []
  };
};

// Helper method to get common symptoms
userSchema.methods.getCommonSymptoms = function(symptoms) {
  const symptomCount = {};
  symptoms.forEach(s => {
    symptomCount[s.name] = (symptomCount[s.name] || 0) + 1;
  });
  
  return Object.entries(symptomCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
};

// Method to check if user needs medication reminder
userSchema.methods.getDueMedications = function() {
  const now = new Date();
  return this.medications.filter(med => {
    if (!med.active) return false;
    if (med.endDate && med.endDate < now) return false;
    
    // Check frequency (simplified)
    const lastTaken = med.lastTaken || med.startDate;
    const hoursSinceLast = (now - lastTaken) / (1000 * 60 * 60);
    
    if (med.frequency === 'daily' && hoursSinceLast >= 24) return true;
    if (med.frequency === 'twice_daily' && hoursSinceLast >= 12) return true;
    
    return false;
  });
};

// Method to update app usage
userSchema.methods.updateAppUsage = async function(feature) {
  this.appUsage.lastLogin = new Date();
  this.appUsage.loginCount += 1;
  
  const featureUsage = this.appUsage.featuresUsed.find(f => f.feature === feature);
  if (featureUsage) {
    featureUsage.count += 1;
    featureUsage.lastUsed = new Date();
  } else {
    this.appUsage.featuresUsed.push({
      feature,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  await this.save();
};

// Method to get personalized health recommendations
userSchema.methods.getPersonalizedRecommendations = async function() {
  const recommendations = [];
  
  // BMI-based recommendations
  const bmi = await this.currentBMI;
  if (bmi) {
    if (bmi.value < 18.5) {
      recommendations.push({
        category: 'nutrition',
        message: 'You are underweight. Consider increasing calorie intake with nutrient-rich foods.',
        priority: 'high'
      });
    } else if (bmi.value > 25) {
      recommendations.push({
        category: 'nutrition',
        message: 'Consider a balanced diet and regular exercise to maintain healthy weight.',
        priority: 'medium'
      });
    }
  }
  
  // PCOS-specific recommendations
  if (this.gender === 'female' && this.pcosData) {
    if (this.pcosData.riskScore?.level === 'high') {
      recommendations.push({
        category: 'pcos',
        message: 'High PCOS risk detected. Consult a gynecologist for proper diagnosis.',
        priority: 'high'
      });
      recommendations.push({
        category: 'diet',
        message: 'Follow low glycemic index diet and include more fiber-rich foods.',
        priority: 'high'
      });
      recommendations.push({
        category: 'exercise',
        message: 'Regular yoga and cardio exercises can help manage PCOS symptoms.',
        priority: 'medium'
      });
    }
  }
  
  // Activity-based recommendations
  const recentActivities = this.activities.filter(a => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return a.date >= weekAgo;
  });
  
  if (recentActivities.length < 3) {
    recommendations.push({
      category: 'activity',
      message: 'Try to increase physical activity. Aim for at least 30 minutes daily.',
      priority: 'medium'
    });
  }
  
  return recommendations;
};

// Export the model
module.exports = mongoose.model('User', userSchema);