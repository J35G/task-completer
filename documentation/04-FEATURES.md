# Features Documentation

Comprehensive documentation of all features in Task Completer.

## Core Features

### 1. Task Management

#### Creating Tasks
- **Location**: Tasks tab → "+ Add Task" button
- **Fields**:
  - Title (required)
  - Notes (optional)
  - Due Date (optional, datetime picker)
  - Repeat (none, daily, weekly)
  - Priority (low, medium, high)
  - Score Value (1-100 points)
- **Validation**: Title is required
- **Storage**: Saved to IndexedDB immediately

#### Editing Tasks
- **Access**: Click "Edit" button on task card
- **Behavior**: Opens modal with pre-filled form
- **Updates**: All fields can be modified
- **Save**: Updates existing task in database

#### Completing Tasks
- **Action**: Click "Complete" button
- **Effects**:
  - Task marked as completed
  - Score added to total
  - Streak updated (if first completion today)
  - Notification shown
  - Repeat tasks create new instance
- **Visual**: Task card grayed out, strikethrough text

#### Deleting Tasks
- **Action**: Click "Delete" button
- **Confirmation**: Confirmation dialog appears
- **Permanent**: Cannot be undone
- **Storage**: Removed from database

#### Task Filtering
- **Options**:
  - All: Shows all tasks
  - Pending: Only incomplete tasks
  - Completed: Only completed tasks
- **Behavior**: Filters in real-time
- **Persistence**: Filter resets on page reload

#### Task Sorting
- **Default Order**:
  1. Incomplete tasks first
  2. Completed tasks last
  3. By due date (earliest first)
  4. By priority (high → low)
- **Dynamic**: Updates as tasks change

#### Recurring Tasks
- **Types**:
  - Daily: Creates new task tomorrow
  - Weekly: Creates new task in 7 days
- **Behavior**: New task inherits all properties
- **Due Date**: Automatically calculated
- **Status**: New task starts as incomplete

### 2. Scoring System

#### Points System
- **Earned**: When task is completed
- **Amount**: Set per task (default: 10 points)
- **Display**: Shown in top bar
- **Storage**: Cumulative total in database

#### Streak Tracking
- **Purpose**: Encourage daily completion
- **Calculation**:
  - First completion: Streak = 1
  - Completed yesterday: Streak increments
  - Missed a day: Streak resets to 1
  - Multiple completions same day: Streak stays same
- **Display**: Fire emoji with count in top bar
- **Visual**: Motivational indicator

#### Statistics
- **Total Score**: Lifetime points earned
- **Current Streak**: Days in a row
- **Completed Today**: Number of tasks (future feature)

### 3. Hydration Tracking

#### Setting Goals
- **Location**: Hydration tab
- **Default**: 8 cups per day
- **Range**: 1-20 cups
- **Storage**: Saved in settings
- **Update**: Changes apply immediately

#### Logging Water
- **Quick Buttons**:
  - +1 Cup
  - +2 Cups
  - +0.5 Cup
- **Action**: Click button to add
- **Feedback**: Progress ring updates, notification shown
- **Storage**: Timestamped entry saved

#### Progress Visualization
- **Progress Ring**: Circular progress indicator
- **Calculation**: Current / Goal * 100%
- **Animation**: Smooth transition on update
- **Color**: Green when on track

#### History Log
- **Display**: List of today's entries
- **Format**: Amount and time
- **Order**: Most recent first
- **Scope**: Today's entries only

#### Reminders (Future)
- **Scheduled**: At specific times (9am, 12pm, 3pm, 6pm, 9pm)
- **Condition**: Only if below goal
- **Notification**: Browser notification
- **Dismissible**: User can dismiss

### 4. AI Body Metrics Calculator

#### Purpose
- Estimate body composition
- Calculate metabolic rates
- Provide health insights
- **Disclaimer**: Estimates only, not medical advice

#### Required Inputs
- **Gender**: Male or Female
- **Age**: Years (1-120)
- **Height**: Centimeters (1-300)
- **Weight**: Kilograms (1-500)
- **Waist**: Circumference in cm (1-200)
- **Neck**: Circumference in cm (1-100)

#### Calculations

##### Body Fat Percentage
- **Method**: Navy Body Fat Formula
- **Male Formula**: 
  ```
  BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
  ```
- **Female Formula**: Modified version (simplified)
- **Output**: Percentage (0-100%)
- **Category**: Essential Fat, Athletes, Fitness, Average, Obese

##### BMI (Body Mass Index)
- **Formula**: `weight (kg) / (height (m))²`
- **Output**: Numeric value
- **Categories**: Underweight, Normal, Overweight, Obese

##### BMR (Basal Metabolic Rate)
- **Method**: Mifflin-St Jeor Equation
- **Male**: `10 * weight + 6.25 * height - 5 * age + 5`
- **Female**: `10 * weight + 6.25 * height - 5 * age - 161`
- **Output**: Calories per day
- **Purpose**: Calories burned at rest

##### TDEE (Total Daily Energy Expenditure)
- **Formula**: `BMR * Activity Multiplier`
- **Multipliers**:
  - Sedentary: 1.2
  - Light: 1.375
  - Moderate: 1.55 (default)
  - Active: 1.725
  - Very Active: 1.9
- **Output**: Calories per day
- **Purpose**: Total calories needed

#### Results Display
- **Format**: Card-based layout
- **Information**: All calculated values
- **Categories**: Body fat category shown
- **Persistence**: Not saved (privacy)

### 5. Notifications

#### Permission
- **Request**: On first use
- **Browser**: User must grant permission
- **Settings**: Can be toggled in settings
- **Status**: Indicator in settings

#### Notification Types

##### Task Reminders
- **Trigger**: Task due within 24 hours
- **Content**: Task title and notes
- **Timing**: At due time
- **Action**: Click opens app

##### Task Completion
- **Trigger**: When task completed
- **Content**: Points earned
- **Timing**: Immediately
- **Purpose**: Positive feedback

##### Hydration Reminders
- **Trigger**: Scheduled times (if below goal)
- **Content**: Current intake and goal
- **Timing**: 9am, 12pm, 3pm, 6pm, 9pm
- **Condition**: Only if below daily goal

##### Water Added
- **Trigger**: When water logged
- **Content**: Amount added
- **Timing**: Immediately
- **Purpose**: Confirmation

#### Notification Features
- **Icon**: App icon
- **Badge**: App icon
- **Click Action**: Opens app
- **Dismissible**: User can dismiss
- **Persistent**: Some require interaction

### 6. Customization

#### Background Image
- **Upload**: Settings → Upload Background
- **Format**: Any image file
- **Storage**: Base64 encoded in IndexedDB
- **Display**: Background overlay with opacity
- **Remove**: Settings → Remove Background
- **Privacy**: Stored locally only

#### Notification Preferences
- **Toggle**: Settings → Notifications
- **Effect**: Enables/disables all notifications
- **Storage**: Saved in settings
- **Immediate**: Takes effect immediately

### 7. Data Management

#### Export Data
- **Location**: Settings → Export Data
- **Format**: JSON file
- **Contents**:
  - All tasks
  - User stats
  - Hydration logs
  - Settings
  - Export timestamp
- **Filename**: `task-completer-backup-YYYY-MM-DD.json`
- **Use Case**: Backup, migration, sharing

#### Import Data
- **Location**: Settings → Import Data
- **Format**: JSON file (from export)
- **Process**:
  1. Select file
  2. Validate format
  3. Clear existing data (optional)
  4. Import new data
  5. Reload app
- **Error Handling**: Shows error if invalid
- **Backup**: Recommended before import

#### Clear All Data
- **Location**: Settings → Clear All Data
- **Confirmation**: Required (cannot undo)
- **Action**: Deletes entire database
- **Effect**: App resets to initial state
- **Use Case**: Fresh start, privacy

## Advanced Features

### 1. Offline Functionality
- **Service Worker**: Caches app files
- **IndexedDB**: Works without internet
- **Sync**: Manual (no auto-sync yet)
- **Limitations**: No cloud features offline

### 2. Progressive Web App (PWA)
- **Installable**: Can be installed on device
- **Standalone**: Runs like native app
- **Offline**: Works without browser
- **Icons**: Custom app icons
- **Manifest**: Defines app metadata

### 3. Responsive Design
- **Mobile**: Optimized for phones
- **Tablet**: Adapted layouts
- **Desktop**: Full feature set
- **Touch**: Touch-friendly targets

## Feature Roadmap

### Planned Features
- [ ] Dark mode
- [ ] Task categories/tags
- [ ] Task search
- [ ] Calendar view
- [ ] Recurring task templates
- [ ] Cloud sync (optional)
- [ ] Multi-device sync
- [ ] Watch app integration
- [ ] Task attachments
- [ ] Subtasks
- [ ] Task collaboration (future)
- [ ] Analytics dashboard
- [ ] Custom themes
- [ ] Export to calendar
- [ ] Task sharing
- [ ] Achievement badges
- [ ] Social features

### Under Consideration
- [ ] Voice input for tasks
- [ ] Location-based reminders
- [ ] Integration with fitness trackers
- [ ] Meal planning features
- [ ] Sleep tracking
- [ ] Habit tracking expansion

## Feature Usage Tips

### Maximizing Productivity
1. Set clear, specific task titles
2. Use priorities to focus on important tasks
3. Set realistic due dates
4. Break large tasks into smaller ones
5. Review and update tasks regularly

### Maintaining Streaks
1. Complete at least one task daily
2. Set daily recurring tasks
3. Check streak in top bar
4. Don't break the chain!

### Effective Hydration Tracking
1. Set realistic daily goals
2. Log water immediately after drinking
3. Use quick buttons for common amounts
4. Check progress throughout the day
5. Adjust goal based on activity level

### Using AI Calculator
1. Measure accurately for best results
2. Update measurements regularly
3. Use as guidance, not medical advice
4. Consult healthcare professionals for health decisions
5. Track changes over time (manually)

## Feature Limitations

### Current Limitations
- No cloud sync
- No multi-device support
- No task sharing
- No calendar integration
- No search functionality
- Limited recurring task options
- No task templates
- No subtasks

### Browser Limitations
- Service workers require HTTPS (or localhost)
- Notifications require user permission
- Some browsers have storage limits
- iOS has limited PWA features

### Privacy Limitations
- Data not encrypted at rest
- No password protection
- No biometric authentication
- Export files not encrypted

