import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate and download a comprehensive clinical PDF Health Report
 * @param {Object} user User profile object
 * @param {Array} history Food log history list
 */
export const generateHealthReportPDF = (user = {}, history = []) => {
  try {
    const doc = new jsPDF();
    const todayStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // 1. Brand Header Banner (Emerald Green #10b981)
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('NutriNexus', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('AI Clinical Health & Nutrition Report', 130, 18);

    // 2. Report Overview Subheader
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Personal Health Profile & Data Summary', 14, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${todayStr}`, 14, 44);

    // 3. User Demographics Table
    const userRows = [
      ['Full Name', user.name || 'Harsha', 'Gender & Age', `${user.gender || 'Male'}, ${user.age || 26} yrs`],
      ['Height', `${user.height || 1.75} m`, 'Current Weight', `${user.weight || 68} kg`],
      ['Body Mass Index (BMI)', `${user.bmi || 22.2} kg/m²`, 'Health Goal', user.goal || 'Healthy Lifestyle'],
      ['Activity Level', user.activity_level || 'Moderate', 'Dietary Preference', user.dietary_preference || 'Vegetarian'],
      ['Diseases / Conditions', Array.isArray(user.diseases) && user.diseases.length ? user.diseases.join(', ') : 'None Reported', 'Daily Water Requirement', `${user.water_requirement || 2.5} L`]
    ];

    doc.autoTable({
      startY: 48,
      head: [['Metric', 'Value', 'Metric', 'Value']],
      body: userRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
        2: { fontStyle: 'bold', fillColor: [248, 250, 252] }
      }
    });

    // 4. Food Log History Table
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 110;

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Logged Daily Meal History', 14, finalY);

    const historyRows = (history || []).slice(0, 100).map(item => [
      item.date ? item.date.split('T')[0] : (item.created_at ? item.created_at.split('T')[0] : 'N/A'),
      (item.meal_type || 'meal').toUpperCase(),
      item.food_name || 'Food Item',
      `${item.calories || 0} kcal`,
      `${item.protein || 0} g`,
      `${item.carbs || 0} g`,
      `${item.fat || 0} g`
    ]);

    if (historyRows.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(148, 163, 184);
      doc.text('No historical food log entries found.', 14, finalY + 8);
    } else {
      doc.autoTable({
        startY: finalY + 4,
        head: [['Date', 'Meal Type', 'Food Item', 'Calories', 'Protein', 'Carbs', 'Fat']],
        body: historyRows,
        theme: 'striped',
        headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2.5 }
      });
    }

    // 5. Footer Disclaimer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Disclaimer: Confidential NutriNexus Personal Health Report. Consult a licensed medical professional before altering prescriptions or diets.',
        14,
        287
      );
      doc.text(`Page ${i} of ${pageCount}`, 190, 287, { align: 'right' });
    }

    // Trigger PDF download
    doc.save(`NutriNexus_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error("jspdf error, falling back to printable HTML PDF generator:", err);
    // Fallback: Generate printable PDF window
    generatePrintablePDFReport(user, history);
  }
};

/**
 * Fallback Printable PDF Generator Window
 */
const generatePrintablePDFReport = (user = {}, history = []) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const historyHtml = (history || []).slice(0, 100).map(item => `
    <tr>
      <td>${item.date ? item.date.split('T')[0] : 'N/A'}</td>
      <td><strong>${(item.meal_type || 'meal').toUpperCase()}</strong></td>
      <td>${item.food_name || 'Food item'}</td>
      <td>${item.calories || 0} kcal</td>
      <td>${item.protein || 0}g</td>
      <td>${item.carbs || 0}g</td>
      <td>${item.fat || 0}g</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>NutriNexus Health Report PDF</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
        .header { background: #10b981; color: white; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 0; font-size: 12px; }
        h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th, td { padding: 10px; border: 1px solid #cbd5e1; text-align: left; }
        th { background: #0d9488; color: white; }
        tr:nth-child(even) { background: #f8fafc; }
        .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f1f5f9; padding: 15px; border-radius: 10px; font-size: 13px; }
        .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>NutriNexus</h1>
          <p>AI Clinical Health & Nutrition Report</p>
        </div>
        <div style="text-align: right;">
          <p><strong>Generated:</strong> ${todayStr}</p>
        </div>
      </div>

      <h2>Personal Health Profile</h2>
      <div class="profile-grid">
        <div><strong>Name:</strong> ${user.name || 'Harsha'}</div>
        <div><strong>Gender & Age:</strong> ${user.gender || 'Male'}, ${user.age || 26} yrs</div>
        <div><strong>Height & Weight:</strong> ${user.height || 1.75} m • ${user.weight || 68} kg</div>
        <div><strong>BMI:</strong> ${user.bmi || 22.2} kg/m²</div>
        <div><strong>Goal:</strong> ${user.goal || 'Healthy Lifestyle'}</div>
        <div><strong>Dietary Preference:</strong> ${user.dietary_preference || 'Vegetarian'}</div>
      </div>

      <h2>Logged Daily Meal History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Meal Type</th>
            <th>Food Item</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Carbs</th>
            <th>Fat</th>
          </tr>
        </thead>
        <tbody>
          ${historyHtml || '<tr><td colspan="7" style="text-align:center;">No logs found</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Disclaimer: Confidential NutriNexus Personal Health Report. Always consult a qualified physician before altering diets or medication.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

export default generateHealthReportPDF;
