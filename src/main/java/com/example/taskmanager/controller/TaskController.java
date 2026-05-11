package com.example.taskmanager.controller;

import com.example.taskmanager.entity.Project;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.repository.ProjectRepository;
import com.example.taskmanager.repository.TaskRepository;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    @Autowired
    TaskRepository taskRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public List<Task> getAllTasks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).get();
        
        if (user.getRole() == User.Role.ADMIN) {
            return taskRepository.findAll();
        } else {
            return taskRepository.findByAssignee(user);
        }
    }

    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId, @RequestBody Task task) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    task.setProject(project);
                    if (task.getStatus() == null) task.setStatus(Task.Status.TODO);
                    return ResponseEntity.ok(taskRepository.save(task));
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestParam Task.Status status) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setStatus(status);
                    return ResponseEntity.ok(taskRepository.save(task));
                }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assignee")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> assignTask(@PathVariable Long id, @RequestParam Long userId) {
        return taskRepository.findById(id)
                .flatMap(task -> userRepository.findById(userId).map(user -> {
                    task.setAssignee(user);
                    return ResponseEntity.ok(taskRepository.save(task));
                })).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}
