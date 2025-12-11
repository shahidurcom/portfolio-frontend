// ============================================
// NAVBAR FUNCTIONALITY
// ============================================

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria-expanded
        const isExpanded = navMenu.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section, [id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ============================================
// FORM STEP NAVIGATION
// ============================================

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';

    toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <span>${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    toastContainer.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => {
        if (toast.parentElement) {
            toast.remove();
        }
    });
}


// ============================================
// FORM SUBMISSION WITH NODE.JS BACKEND
// ============================================

// Determine API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/send-project-request' // Local Development
    : 'https://portfolio-backend-ten-phi.vercel.app/api/send-project-request'; // Production Backend

document.getElementById('projectForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnIcon.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    
    try {
        // Create FormData object for multipart/form-data submission
        const formData = new FormData();
        
        // Append simple fields
        formData.append('projectName', document.getElementById('projectName').value);
        formData.append('projectType', document.getElementById('projectType').value);
        formData.append('projectDescription', document.getElementById('projectDescription').value);
        formData.append('timeline', document.getElementById('timeline').value);
        const budget = document.querySelector('input[name="budget"]:checked');
        if (budget) formData.append('budget', budget.value);
        
        // Client Info
        formData.append('clientName', document.getElementById('fullName').value);
        formData.append('clientEmail', document.getElementById('email').value);
        formData.append('clientPhone', document.getElementById('phone').value || 'Not provided');
        formData.append('clientCompany', document.getElementById('company').value || '');
        formData.append('additionalInfo', document.getElementById('additionalInfo').value || 'None');
        formData.append('timestamp', new Date().toLocaleString());

        // Append files
        // Append files
        const files = document.getElementById('referenceFiles').files;
        for (let i = 0; i < files.length; i++) {
            formData.append('referenceFiles', files[i]);
        }

        // Send to Node.js Backend
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Success:', result);
            showToast('Request submitted successfully!', 'success');
            showSuccess();
            // Reset files
            fileInput.value = '';
            fileUploadArea.querySelector('.file-upload-text').textContent = 'Upload files';
            fileUploadArea.style.borderColor = '';
            fileUploadArea.style.background = '';
        } else {
            throw new Error(result.message || 'Submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showToast('Submission failed. Please try again.', 'error');
        showError('There was an error submitting your request. Please try again or contact me directly at support@shahidur.com');
    } finally {
        // Reset button state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnIcon.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});

function showSuccess() {
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById('successMessage').style.display = 'block';
    
    // Update all progress steps to completed
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active');
        step.classList.add('completed');
    });

    // Scroll to success message
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    // Keep form visible for retry
    // document.getElementById('errorText').textContent = message; // Using toast instead
    // But keeping existing error logic if user prefers the card view
    const errorMessage = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = message;
    errorMessage.style.display = 'block';
    // Hide sections to show error card? No, usually better to stay on form.
    // However, the original logic hid sections. Let's respect original UX for major errors but use Toasts for validation.
    
    document.querySelectorAll('.form-section').forEach(section => {
         section.style.display = 'none';
    });

    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
    // Restore last step? Usually Step 3 is where submit happens
    document.getElementById('step3').style.display = 'block';
}

function nextStep(currentStep) {
    // Validate current step before proceeding
    const currentForm = document.getElementById(`step${currentStep}`);
    
    // Select all required inputs
    const inputs = currentForm.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    let firstInvalidInput = null;

    inputs.forEach(input => {
        let isInputValid = true;

        if (input.type === 'radio') {
            // For radio buttons, check if any button in the group is checked
            const groupName = input.name;
            const group = currentForm.querySelectorAll(`input[name="${groupName}"]`);
            // Check if at least one is checked
            const isChecked = Array.from(group).some(radio => radio.checked);
            if (!isChecked) {
                isInputValid = false;
            }
        } else {
            // For text, select, textarea
            if (!input.value.trim()) {
                isInputValid = false;
            }
        }

        if (!isInputValid) {
            isValid = false;
            if (!firstInvalidInput) firstInvalidInput = input;
            
            // Visual feedback
            if (input.type === 'radio') {
                // Highlight the container or parent for radios if necessary
                // In this specific form, we can find the closest form-group
                const formGroup = input.closest('.form-group');
                if (formGroup) formGroup.style.border = '1px solid var(--error)';
            } else {
                input.style.borderColor = 'var(--error)';
            }
        } else {
            // Clear error styles
            if (input.type === 'radio') {
                const formGroup = input.closest('.form-group');
                if (formGroup) formGroup.style.border = '';
            } else {
                input.style.borderColor = '';
            }
        }
    });

    if (!isValid) {
        showToast('Please fill in all required fields.', 'error');
        if (firstInvalidInput) {
            // Focus isn't great for radios, but good for others
            if (firstInvalidInput.type !== 'radio') firstInvalidInput.focus();
        }
        return;
    }

    document.getElementById(`step${currentStep}`).style.display = 'none';
    document.getElementById(`step${currentStep + 1}`).style.display = 'block';
    
    // Update progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps[currentStep - 1].classList.remove('active');
    progressSteps[currentStep - 1].classList.add('completed');
    progressSteps[currentStep].classList.add('active');

    // Scroll to top of form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

function prevStep(currentStep) {
    document.getElementById(`step${currentStep}`).style.display = 'none';
    const prevStepIndex = currentStep - 1;
    document.getElementById(`step${prevStepIndex}`).style.display = 'block';
    
    // Update progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    // Current step (which is index currentStep - 1) is no longer active
    progressSteps[currentStep - 1].classList.remove('active');
    // Previous step (index currentStep - 2) becomes active again
    progressSteps[prevStepIndex - 1].classList.remove('completed'); // Optional: remove completed if going back?
    progressSteps[prevStepIndex - 1].classList.add('active');

    // Scroll to top of form
    document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FILE UPLOAD INTERACTION
// ============================================

const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('referenceFiles');

fileUploadArea.addEventListener('click', function(e) {
    if (e.target !== fileInput) {
        fileInput.click();
    }
});

fileInput.addEventListener('change', function(e) {
    const files = this.files;
    
    if (files.length > 0) {
        fileUploadArea.querySelector('.file-upload-text').textContent = `${files.length} file(s) selected`;
        fileUploadArea.style.borderColor = 'var(--success)';
        fileUploadArea.style.background = 'var(--success-bg)';
    } else {
        fileUploadArea.querySelector('.file-upload-text').textContent = 'Upload files';
        fileUploadArea.style.borderColor = '';
        fileUploadArea.style.background = '';
    }
});

// Drag and drop functionality
fileUploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-over');
});

fileUploadArea.addEventListener('dragleave', function() {
    this.classList.remove('drag-over');
});

fileUploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    fileInput.files = files;
    
    if (files.length > 0) {
        fileUploadArea.querySelector('.file-upload-text').textContent = `${files.length} file(s) selected`;
        fileUploadArea.style.borderColor = 'var(--success)';
        fileUploadArea.style.background = 'var(--success-bg)';
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// FOOTER CURRENT YEAR
// ============================================

document.getElementById('currentYear').textContent = new Date().getFullYear();

// Email validation
document.getElementById('email').addEventListener('blur', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        this.style.borderColor = 'var(--error)';
        showToast('Please enter a valid email address', 'error');
    }
});

// Phone validation (optional but format check)
document.getElementById('phone').addEventListener('blur', function() {
    if (this.value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(this.value)) {
            this.style.borderColor = 'var(--error)';
            showToast('Please enter a valid phone number', 'error');
        }
    }
});

function resetForm() {
    window.location.reload();
}

console.log('%c Portfolio Loaded Successfully! ', 'background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');