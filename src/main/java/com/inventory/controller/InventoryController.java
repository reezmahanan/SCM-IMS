package com.inventory.controller;

import com.inventory.entity.Inventory;
import com.inventory.entity.Product;
import com.inventory.repository.InventoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3002"})
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/low-stock")
    public List<Inventory> getLowStockAlerts() {
        return inventoryService.getLowStockAlerts();
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addStock(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        String referenceDoc = request.get("referenceDoc").toString();

        Map<String, Object> response = inventoryService.addStock(productId, quantity, referenceDoc);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reduce")
    public ResponseEntity<Map<String, Object>> reduceStock(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        String referenceDoc = request.get("referenceDoc").toString();

        Map<String, Object> response = inventoryService.reduceStock(productId, quantity, referenceDoc);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{id}")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        boolean available = inventoryService.checkAvailability(id, quantity);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", available);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/receive")
    public ResponseEntity<Map<String, Object>> receiveFromProcurement(@RequestBody Map<String, Object> request) {
        return addStock(request);
    }

    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Boolean>> reserveForOrder(@RequestBody Map<String, Object> request) {
        Long productId = Long.valueOf(request.get("productId").toString());
        Integer quantity = Integer.valueOf(request.get("quantity").toString());
        boolean available = inventoryService.checkAvailability(productId, quantity);
        Map<String, Boolean> response = new HashMap<>();
        response.put("reserved", available);
        return ResponseEntity.ok(response);
    }
}

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3002"})
class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProductId(savedProduct.getProductId());
        inventory.setQuantityOnHand(0);
        inventory.setReorderLevel(10);
        inventoryRepository.save(inventory);

        return ResponseEntity.ok(savedProduct);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, Object>> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile file) {
        
        Map<String, Object> response = new HashMap<>();
        
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Product not found");
            return ResponseEntity.status(404).body(response);
        }
        
        Product product = productOpt.get();
        
        if (file.isEmpty()) {
            response.put("success", false);
            response.put("message", "File is empty");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            // Ensure uploads directory exists
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate a unique file name to avoid collision
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Set the URL path to access this image
            String imageUrl = "/uploads/" + fileName;
            product.setImageUrl(imageUrl);
            productRepository.save(product);
            
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}