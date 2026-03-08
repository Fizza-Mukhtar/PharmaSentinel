from django.urls import path
from . import views

urlpatterns = [
    # AUTH
    path("api/login/", views.api_login, name="api_login"),

    path("api/drap/drapdashboard/", views.api_drap_admin_dashboard, name="api_drap_dashboard"),

    path("api/drap/manufacturers/", views.api_drap_view_manufacturers),
    path("api/drap/manufacturers/<int:manufacturer_id>/", views.api_drap_manufacturer_detail),
    path("api/drap/manufacturers/<int:manufacturer_id>/block/", views.api_drap_block_manufacturer),

    path("api/drap/batches/", views.api_drap_view_all_batches),
    path("api/drap/batches/<str:batch_id>/", views.api_drap_batch_detail),
    path("api/drap/batches/<str:batch_id>/validate/", views.api_drap_validate_batch_blockchain),
    path("api/drap/batches/<str:batch_id>/recall/", views.api_drap_recall_batch),
    path("api/drap/batches/<str:batch_id>/mark-suspicious/", views.api_drap_mark_batch_suspicious),

    path("api/drap/supply-chain/", views.api_drap_supply_chain_overview),
    path("api/drap/supply-chain/<str:batch_id>/journey/", views.api_drap_track_batch_journey),

    path("api/drap/analytics/", views.api_drap_analytics_report),
    path("api/drap/notifications/", views.api_drap_notifications),
    path("api/drap/audit-logs/", views.api_drap_audit_logs),

    path("api/drap/distributors/", views.api_drap_view_distributors),
    path("api/drap/warehouses/", views.api_drap_view_warehouses),
    path("api/drap/wholesalers/", views.api_drap_view_wholesalers),
    path("api/drap/shopkeepers/", views.api_drap_view_shopkeepers),

    path("api/drap/search/", views.api_drap_search_batches),
    path("api/drap/health/", views.api_drap_system_health),

    path("api/drap/export/batches/", views.api_drap_export_batches_csv),
    path("api/drap/export/transfers/", views.api_drap_export_transfers_csv),

    path("api/create-batches-bulk/", views.api_create_batches_bulk),



    # MANUFACTURER
    path("api/add_batch/", views.api_create_batch, name="api_add_batch"),
    path("api/view_batches/", views.api_view_batches, name="api_view_batches"),
    path("api/manufacturer_dashboard/", views.api_manufacturer_dashboard, name="api_manufacturer_dashboard"),
    path("api/manufacturer/notifications/", views.api_manufacturer_notifications, name="api_manufacturer_notifications"),

    # BATCH / VERIFY
    path("api/listbatches/", views.api_list_batches, name="api_list_batches"),
    path("api/batches/<str:batch_id>/", views.api_batch_detail, name="api_batch_detail"),
    path("api/verify_batch/<str:batch_id>/", views.api_verify_batch, name="api_verify_batch"),
    path("api/export_batches_csv/", views.api_export_batches_csv, name="api_export_batches_csv"),
    path("api/transfers/", views.api_manufacturer_transfers, name="manufacturer-transfers"),

    path("api/transfer_batch/" , views.api_transfer_batch , name="api_transfer_batch"),

    # DISTRIBUTOR
    path("api/distributor/incoming/", views.api_distributor_incoming, name="api_distributor_incoming"),
    path("api/distributor/confirm-receive/", views.api_distributor_confirm_receive, name="api_distributor_confirm_receive"),
    path("api/distributor/inventory/", views.api_distributor_inventory, name="api_distributor_inventory"),
    path("api/distributor/notifications/", views.api_distributor_notifications, name="api_distributor_notifications"),
    path("api/distributor/history-transfer/", views.api_distributor_transfer_history, name="api_distributor_transfer_history"),
    path("api/distributor/warehouse-users/", views.api_get_warehouse_users, name="api_get_warehouse_users"),
    path("api/distributor/transfer-to-warehouse/", views.api_distributor_transfer_to_warehouse, name="api_distributor_transfer_to_warehouse"),
    path("api/distributor/export/incoming/", views.export_distributor_incoming_csv),
    path("api/distributor/export/outgoing/", views.export_distributor_outgoing_csv),
    path("api/distributor/export/expired/", views.export_distributor_expired_csv),
    path("api/distributor/export/inventory/", views.export_distributor_full_inventory_csv),
    path("api/distributor/report/" , views.api_distributor_report),
    path("api/distributor/reject-transfer/" , views.api_distributor_reject_transfer),

    # WAREHOUSE
    path("api/warehouse/incoming/", views.api_warehouse_incoming, name="api_warehouse_incoming"),
    path("api/warehouse/history-transfer/", views.api_warehouse_transfer_history, name="api_warehouse_transfer_history"),
    path("api/warehouse/confirm-receive/", views.api_warehouse_confirm_receive, name="api_warehouse_confirm_receive"),
    path("api/warehouse/inventory/", views.api_warehouse_inventory, name="api_warehouse_inventory"),
    path("api/warehouse/notifications/", views.api_warehouse_notifications, name="api_warehouse_notifications"),
    path("api/warehouse/report/", views.api_warehouse_report, name="api_warehouse_report"),
    path("api/warehouse/wholesaler-users/", views.api_get_wholesaler_users, name="api_get_wholesaler_users"),
    path("api/warehouse/transfer-to-wholesaler/", views.api_warehouse_transfer_to_wholesaler, name="api_warehouse_transfer_to_wholesaler"),
    path("api/warehouse/export/incoming/", views.export_warehouse_incoming_csv),
    path("api/warehouse/export/outgoing/", views.export_warehouse_outgoing_csv),
    path("api/warehouse/export/expired/", views.export_warehouse_expired_csv),
    path("api/warehouse/export/inventory/", views.export_warehouse_full_inventory_csv),

    # WHOLESALER
    path("api/wholesaler/report/", views.api_wholesaler_report, name="api_wholesaler_report"),

    path("api/wholesaler/notifications/", views.api_wholesaler_notifications, name="api_wholesaler_notifications"),
    path("api/wholesaler/incoming/", views.api_wholesaler_incoming, name="api_wholesaler_incoming"),
    path("api/wholesaler/history-transfer/", views.api_wholesaler_transfer_history, name="api_wholesaler_transfer_history"),
    path("api/wholesaler/accept-transfer/", views.api_wholesaler_accept_transfer, name="api_wholesaler_accept_transfer"),
    path("api/wholesaler/reject-transfer/", views.api_wholesaler_reject_transfer, name="api_wholesaler_reject_transfer"),
    path("api/wholesaler/inventory/", views.api_wholesaler_inventory, name="api_wholesaler_inventory"),
    path("api/wholesaler/shopkeeper-users/", views.api_get_shopkeeper_users, name="api_get_shopkeeper_users"),
    path("api/wholesaler/transfer-to-shopkeeper/", views.api_wholesaler_transfer_to_shopkeeper, name="api_wholesaler_transfer_to_shopkeeper"),
    path("api/wholesaler/export/incoming/", views.export_distributor_incoming_csv),  # reuse or create dedicated
    path("api/wholesaler/export/outgoing/", views.export_distributor_outgoing_csv),
    path("api/wholesaler/export/expired/", views.export_distributor_expired_csv),
    path("api/wholesaler/export/inventory/", views.export_distributor_full_inventory_csv),

    # SHOPKEEPER - Main Features
    path("api/shopkeeper/incoming/", views.api_shopkeeper_incoming, name="api_shopkeeper_incoming"),
    path("api/shopkeeper/accept-transfer/", views.api_shopkeeper_accept_transfer, name="api_shopkeeper_accept_transfer"),
    path("api/shopkeeper/reject-transfer/", views.api_shopkeeper_reject_transfer, name="api_shopkeeper_reject_transfer"),
    path("api/shopkeeper/inventory/", views.api_shopkeeper_inventory, name="api_shopkeeper_inventory"),
    path("api/shopkeeper/sell-medicine/", views.api_shopkeeper_sell_medicine, name="api_shopkeeper_sell_medicine"),
    path("api/shopkeeper/sales-history/", views.api_shopkeeper_sales_history, name="api_shopkeeper_sales_history"),
    path("api/shopkeeper/transfer-history/", views.api_shopkeeper_transfer_history, name="api_shopkeeper_transfer_history"),
    path("api/shopkeeper/notifications/", views.api_shopkeeper_notifications, name="api_shopkeeper_notifications"),
    path("api/shopkeeper/dashboard/", views.api_shopkeeper_dashboard, name="api_shopkeeper_dashboard"),
    path("api/shopkeeper/report/", views.api_shopkeeper_report, name="api_shopkeeper_report"),
    path("api/shopkeeper/verify-medicine/<str:batch_id>/", views.api_shopkeeper_verify_medicine, name="api_shopkeeper_verify_medicine"),

# SHOPKEEPER - CSV Exports
    path("api/shopkeeper/export/incoming/", views.export_shopkeeper_incoming_csv, name="export_shopkeeper_incoming_csv"),
    path("api/shopkeeper/export/sales/", views.export_shopkeeper_sales_csv, name="export_shopkeeper_sales_csv"),
    path("api/shopkeeper/export/expired/", views.export_shopkeeper_expired_csv, name="export_shopkeeper_expired_csv"),
    path("api/shopkeeper/export/inventory/", views.export_shopkeeper_inventory_csv, name="export_shopkeeper_inventory_csv"),

    # PUBLIC
    path("api/customer/report-suspicious/", views.api_customer_report_suspicious, name="api_customer_report_suspicious"),
    
    # DRAP Admin - View Reports
    path("api/drap/reports/", views.api_drap_view_reports, name="api_drap_view_reports"),
    path(
        'api/customer/report-suspicious/',
        views.api_customer_report_suspicious,
        name='customer_report_suspicious'
    ),
    
    
    # DRAP view single report detail
    path(
        'api/drap/reports/<int:report_id>/',
        views.api_drap_report_detail,
        name='drap_report_detail'
    ),
    
    # DRAP update report status
    path(
        'api/drap/reports/<int:report_id>/update-status/',
        views.api_drap_update_report_status,
        name='drap_update_report_status'
    ),
    path("api/drap/reports/<int:report_id>/update/", views.api_drap_update_report_status, name="api_drap_update_report_status"),
]



