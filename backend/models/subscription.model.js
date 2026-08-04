import { mongoose } from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    price: {
        type: Number,
        required: [true, 'Subscription Price is required'],
        min: [0, 'Price must be greater than 0'],
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'INR', 'PKR', 'JPY', 'CAD', 'AUD', 'RP.'],
        default: 'USD',
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
    },
    category: {
        type: String,
        enum: ['entertainment', 'productivity', 'education', 'health', 'finance', 'ai', 'other'],
        default: 'other',
        lowercase: true,
        trim: true,
    },
    plan: {
        type: String,
        trim: true,
    },
    icon: {
        type: String,
        trim: true,
        default: 'default',
    },
    color: {
        type: String,
        trim: true,
        default: '#e0e0e0',
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'canceled', 'expired'],
        default: 'active',
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(Date.now() + 60000),
            message: 'Start date cannot be in the future',
        }
    },
    renewalDate: {
        type: Date,
        required: false,
        validate: {
            validator: function (value) {
                if (!value) return true;
                const startDate = this.startDate || (this.getUpdate ? (this.getUpdate().startDate || (this.getUpdate().$set && this.getUpdate().$set.startDate)) : null);
                if (!startDate) return true;
                return new Date(value) > new Date(startDate);
            },
            message: 'Renewal date must be after start date',
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }
}, {timestamps: true});

// auto calculate renewal date if missing
subscriptionSchema.pre('save', function () {
    if(!this.renewalDate){
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Auto-update the status if renewal date has passed
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }
});

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

export default Subscription;