// This code should be pasted into the code.gs file in Google Apps Script

const SHEET_ID = '1E0QcwroFHAZ0zr8oWBCytxE0iucRkqxHveNBvMsOYn8';

function doGet(e) {
  const action = e.parameter.action;
  const params = e.parameter;
  let result = {};

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (action === 'getMenu') {
      result = getData(ss, '菜單');
    } else if (action === 'getRestaurantItems') {
      // Use the new sheet or fallback to mock if empty/missing
      result = getRestaurantItems(ss); 
    } else if (action === 'getFAQ') {
      result = getData(ss, '常見問題');
    } else if (action === 'getPromotions') {
      result = getData(ss, '活動優惠');
    } else if (action === 'getMember') {
      result = getMember(ss, params.lineId);
    } else if (action === 'registerMember') {
      const data = JSON.parse(params.data);
      result = registerMember(ss, data);
    } else if (action === 'makeReservation') {
      const data = JSON.parse(params.data);
      result = makeReservation(ss, data);
    } else if (action === 'getReservations') {
      result = getReservations(ss); // All for admin
    } else if (action === 'getMemberReservations') {
      result = getMemberReservations(ss, params.phone); // Specific user
    } else if (action === 'getStats') {
      result = getStats(ss);
    } else if (action === 'updateReservationStatus') {
      result = updateReservationStatus(ss, params.id, params.status);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Generic function to get data from a sheet as an array of objects
function getData(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // Auto-create if missing (helper)
    if (sheetName === '本店餐點') {
      sheet = ss.insertSheet('本店餐點');
      sheet.appendRow(['Category', 'Name', 'Price', 'Description', 'Image', 'Tags']);
      // Add some default data
      sheet.appendRow(['義大利麵', '宮保辣味雞丁義大利麵', '260', '辣度固定', '', 'spicy']);
      sheet.appendRow(['義大利麵', '蒜香白酒蛤蠣義大利麵', '280', '鮮甜海味', '', '']);
      sheet.appendRow(['PIZZA', '夏威夷蝦仁', '280', '7吋', '', '']);
      sheet.appendRow(['飲品', '可樂', '60', '', '', 'isDrink']);
    } else {
      return { success: false, message: 'Sheet not found: ' + sheetName };
    }
  }
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { success: true, data: [] };

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Map columns based on likely headers
      if(header === 'Category') obj['category'] = row[index];
      else if(header === 'Name') obj['name'] = row[index];
      else if(header === 'Price') obj['price'] = row[index];
      else if(header === 'Description') obj['description'] = row[index];
      else if(header === 'Image') obj['image'] = row[index];
      else if(header === 'Tags') obj['tags'] = row[index] ? row[index].toString().split(',') : [];
      else obj[header] = row[index];
    });
    // Add logic flags
    if (obj['category'] && (obj['category'].includes('義大利麵') || obj['category'].includes('Pasta'))) {
      obj['hasNoodleSelection'] = true;
      obj['allowCombo'] = true;
    }
    if (obj['category'] && (obj['category'].includes('燉飯') || obj['category'].includes('焗烤') || obj['category'].includes('PIZZA'))) {
      obj['allowCombo'] = true;
    }
    if (obj['category'] && obj['category'].includes('飲品')) {
      obj['isDrink'] = true;
    }
    // Assign ID if missing
    if (!obj['id']) obj['id'] = obj['name']; 
    
    return obj;
  });
  return { success: true, data: data };
}

function getRestaurantItems(ss) {
  return getData(ss, '本店餐點');
}

function getMember(ss, lineId) {
  const sheet = ss.getSheetByName('會員資料');
  const rows = sheet.getDataRange().getValues();
  const memberRow = rows.find(r => r[1] == lineId); 
  if (memberRow) {
    return {
      success: true,
      member: {
        id: memberRow[0],
        lineId: memberRow[1],
        name: memberRow[2],
        phone: memberRow[3],
        points: memberRow[4]
      }
    };
  }
  return { success: false, message: 'Member not found' };
}

function registerMember(ss, data) {
  let sheet = ss.getSheetByName('會員資料');
  if (!sheet) {
    sheet = ss.insertSheet('會員資料');
    sheet.appendRow(['ID', 'LineID', 'Name', 'Phone', 'Points']);
  }
  const newId = 'M' + new Date().getTime();
  sheet.appendRow([newId, data.lineId, data.name, data.phone, 0]);
  return { success: true, member: { ...data, id: newId, points: 0 } };
}

function generateBookingCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let code = "";
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}

function makeReservation(ss, data) {
  let sheet = ss.getSheetByName('訂位資訊');
  if (!sheet) {
     sheet = ss.insertSheet('訂位資訊');
     sheet.appendRow(['ID', 'Name', 'Phone', 'Date', 'Time', 'Pax', 'Items', 'Status', 'TableID', 'CreatedAt']);
  }
  
  // New ID format: 2 random letters + 4 random numbers
  let id = generateBookingCode();
  
  // Ensure uniqueness (simple check)
  const existing = sheet.getRange("A:A").getValues().flat();
  while (existing.includes(id)) {
    id = generateBookingCode();
  }

  const tableId = 'T' + Math.floor(Math.random() * 10 + 1); 
  
  sheet.appendRow([
    id, 
    data.name, 
    data.phone, 
    data.date, 
    data.time, 
    data.pax, 
    data.items || '[]', 
    'Pending', 
    tableId, 
    new Date().toISOString()
  ]);
  
  return { success: true, reservationId: id, tableId: tableId };
}

function getReservations(ss) {
  return getData(ss, '訂位資訊');
}

function getMemberReservations(ss, phone) {
  const result = getData(ss, '訂位資訊');
  if (result.success && result.data) {
    // Filter by phone
    // Note: Phone is stored as string/number, normalize comparison
    const filtered = result.data.filter(r => String(r['Phone']) === String(phone) || String(r['Phone']) === String(phone).replace(/^0/, ''));
    
    // Map headers to consistent keys if needed (getData does basic mapping, but let's ensure)
    const mapped = filtered.map(r => ({
      id: r['ID'] || r['id'],
      name: r['Name'] || r['name'],
      phone: r['Phone'] || r['phone'],
      date: r['Date'] || r['date'],
      time: r['Time'] || r['time'],
      pax: r['Pax'] || r['pax'],
      items: r['Items'] || r['items'],
      status: r['Status'] || r['status'],
      tableId: r['TableID'] || r['tableId'],
      createdAt: r['CreatedAt'] || r['createdAt']
    }));

    // Sort by date desc
    mapped.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { success: true, data: mapped };
  }
  return result;
}

function getStats(ss) {
  return getData(ss, '營收趨勢');
}

function updateReservationStatus(ss, id, status) {
  const sheet = ss.getSheetByName('訂位資訊');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 8).setValue(status); 
      return { success: true };
    }
  }
  return { success: false, message: 'Reservation ID not found' };
}