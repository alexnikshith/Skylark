import pandas as pd
import json
import os
import re

def clean_value(val):
    if pd.isna(val):
        return None
    val_str = str(val).strip()
    if val_str in ['nan', 'NaN', 'None', '', 'Nat']:
        return None
    return val

def parse_deals(filepath):
    df = pd.read_excel(filepath)
    deals = []
    for idx, row in df.iterrows():
        # Skip duplicate header rows or invalid rows
        deal_name = clean_value(row.get('Deal Name'))
        if not deal_name or str(deal_name).strip() in ['Deal Name', 'nan']:
            continue
        
        masked_val = clean_value(row.get('Masked Deal value'))
        try:
            val_num = float(masked_val) if masked_val is not None else 0.0
        except:
            val_num = 0.0
            
        prob = clean_value(row.get('Closure Probability'))
        try:
            prob_num = float(prob) if prob is not None else 0.0
        except:
            prob_num = 0.0

        close_date = str(clean_value(row.get('Close Date (A)')) or '')
        tentative_date = str(clean_value(row.get('Tentative Close Date')) or '')
        created_date = str(clean_value(row.get('Created Date')) or '')
        
        deals.append({
            "id": f"deal-{idx+1}",
            "dealName": str(deal_name),
            "ownerCode": str(clean_value(row.get('Owner code')) or 'Unassigned'),
            "clientCode": str(clean_value(row.get('Client Code')) or 'Unknown'),
            "dealStatus": str(clean_value(row.get('Deal Status')) or 'Open'),
            "closeDateActual": close_date if close_date != 'None' else None,
            "closureProbability": prob_num,
            "maskedDealValue": val_num,
            "tentativeCloseDate": tentative_date if tentative_date != 'None' else None,
            "dealStage": str(clean_value(row.get('Deal Stage')) or 'Lead Generated'),
            "productDeal": str(clean_value(row.get('Product deal')) or 'Services'),
            "sector": str(clean_value(row.get('Sector/service')) or 'Others'),
            "createdDate": created_date if created_date != 'None' else None
        })
    return deals

def parse_work_orders(filepath):
    df = pd.read_excel(filepath, header=1)
    work_orders = []
    for idx, row in df.iterrows():
        deal_name = clean_value(row.get('Deal name masked'))
        if not deal_name or str(deal_name).strip() in ['Deal name masked', 'nan']:
            continue
            
        def get_num(col):
            v = clean_value(row.get(col))
            try:
                return float(v) if v is not None else 0.0
            except:
                return 0.0

        def get_str(col, default=None):
            v = clean_value(row.get(col))
            return str(v) if v is not None else default

        work_orders.append({
            "id": f"wo-{idx+1}",
            "dealName": str(deal_name),
            "customerCode": get_str('Customer Name Code', 'Unknown'),
            "serialNo": get_str('Serial #', f'WO-{idx+1}'),
            "natureOfWork": get_str('Nature of Work', 'General Services'),
            "lastExecutedMonth": get_str('Last executed month of recurring project'),
            "executionStatus": get_str('Execution Status', 'Not Started'),
            "dataDeliveryDate": get_str('Data Delivery Date'),
            "dateOfPoLoi": get_str('Date of PO/LOI'),
            "documentType": get_str('Document Type', 'PO'),
            "probableStartDate": get_str('Probable Start Date'),
            "probableEndDate": get_str('Probable End Date'),
            "personnelCode": get_str('BD/KAM Personnel code', 'Unassigned'),
            "sector": get_str('Sector', 'Others'),
            "typeOfWork": get_str('Type of Work', 'Ad-hoc'),
            "softwarePlatformIncluded": get_str('Is any Skylark software platform part of the client deliverables in this deal?', 'No'),
            "lastInvoiceDate": get_str('Last invoice date'),
            "latestInvoiceNo": get_str('latest invoice no.'),
            "amountExclGst": get_num('Amount in Rupees (Excl of GST) (Masked)'),
            "amountInclGst": get_num('Amount in Rupees (Incl of GST) (Masked)'),
            "billedValueExclGst": get_num('Billed Value in Rupees (Excl of GST.) (Masked)'),
            "billedValueInclGst": get_num('Billed Value in Rupees (Incl of GST.) (Masked)'),
            "collectedAmountInclGst": get_num('Collected Amount in Rupees (Incl of GST.) (Masked)'),
            "amountToBeBilledExclGst": get_num('Amount to be billed in Rs. (Exl. of GST) (Masked)'),
            "amountToBeBilledInclGst": get_num('Amount to be billed in Rs. (Incl. of GST) (Masked)'),
            "amountReceivable": get_num('Amount Receivable (Masked)'),
            "arPriorityAccount": get_str('AR Priority account'),
            "quantityOps": get_num('Quantity by Ops'),
            "quantityPo": get_num('Quantities as per PO'),
            "quantityBilled": get_num('Quantity billed (till date)'),
            "balanceQuantity": get_num('Balance in quantity'),
            "invoiceStatus": get_str('Invoice Status'),
            "expectedBillingMonth": get_str('Expected Billing Month'),
            "actualBillingMonth": get_str('Actual Billing Month'),
            "actualCollectionMonth": get_str('Actual Collection Month'),
            "woStatusBilled": get_str('WO Status (billed)'),
            "collectionStatus": get_str('Collection status'),
            "collectionDate": get_str('Collection Date'),
            "billingStatus": get_str('Billing Status', 'Pending')
        })
    return work_orders

if __name__ == '__main__':
    deals = parse_deals('Deal funnel Data.xlsx')
    work_orders = parse_work_orders('Work_Order_Tracker Data.xlsx')
    
    os.makedirs('src/data', exist_ok=True)
    out_data = {
        "deals": deals,
        "workOrders": work_orders
    }
    with open('src/data/sampleData.json', 'w') as f:
        json.dump(out_data, f, indent=2)
        
    print(f"Parsed {len(deals)} deals and {len(work_orders)} work orders successfully into src/data/sampleData.json.")
